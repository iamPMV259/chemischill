import os
import logging
from urllib.parse import quote
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from fastapi import UploadFile
from botocore.exceptions import ClientError
from database.models import (
    Document, DocumentTag, DocumentBookmark, DocumentDownload, Category,
    Tag, FileTypeEnum, DocumentStatusEnum,
)
from hooks.error import NotFoundError, ForbiddenError, ValidationError, ConflictError
from utils.storage import (
    upload_to_cloudinary, upload_to_r2,
    delete_from_cloudinary, delete_from_r2, create_r2_signed_url, get_r2_object,
)
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)

MIME_TO_FILETYPE = {
    "application/pdf": FileTypeEnum.PDF,
    "application/msword": FileTypeEnum.DOC,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileTypeEnum.DOCX,
}
IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp"}
DOC_MIMES = set(MIME_TO_FILETYPE.keys())
ALLOWED_MIMES = IMAGE_MIMES | DOC_MIMES


def _doc_to_dict(doc: Document, expose_file_url: bool = False) -> dict:
    preview_url = None
    if doc.file_type in {FileTypeEnum.IMAGE, FileTypeEnum.DOC, FileTypeEnum.DOCX}:
        preview_url = doc.file_url

    return {
        "id": doc.id,
        "title": doc.title,
        "description": doc.description,
        "file_url": doc.file_url if expose_file_url else None,
        "thumbnail_url": doc.thumbnail_url,
        "file_type": doc.file_type.value,
        "file_size_bytes": doc.file_size_bytes,
        "allow_download": doc.allow_download,
        "featured": doc.featured,
        "status": doc.status.value,
        "views": doc.views,
        "downloads": doc.downloads,
        "preview_url": preview_url,
        "created_at": doc.created_at,
        "tags": [
            {
                "id": dt.tag.id,
                "name": dt.tag.name_vi or dt.tag.name,
                "name_vi": dt.tag.name_vi or dt.tag.name,
                "name_en": dt.tag.name,
                "category": dt.tag.category.value,
            }
            for dt in doc.tags
        ],
        "category": {"id": doc.category.id, "name_vi": doc.category.name_vi, "name_en": doc.category.name_en} if doc.category else None,
    }


def _content_disposition_inline(filename: str) -> str:
    ascii_filename = filename.encode("ascii", "ignore").decode("ascii") or "document.pdf"
    ascii_filename = ascii_filename.replace('"', "")
    encoded_filename = quote(filename, safe="")
    return f"inline; filename=\"{ascii_filename}\"; filename*=UTF-8''{encoded_filename}"


class DocumentsService(metaclass=SingletonMeta):

    async def _get_category_scope_ids(self, db: AsyncSession, category_id: str) -> list[str]:
        result = await db.execute(select(Category.id, Category.parent_id))
        rows = result.all()

        children_by_parent: dict[str | None, list[str]] = {}
        known_ids = set()
        for row in rows:
            known_ids.add(row.id)
            children_by_parent.setdefault(row.parent_id, []).append(row.id)

        if category_id not in known_ids:
            return []

        scoped_ids: list[str] = []
        stack = [category_id]
        while stack:
            current_id = stack.pop()
            scoped_ids.append(current_id)
            stack.extend(children_by_parent.get(current_id, []))
        return scoped_ids

    async def list_documents(
        self,
        db: AsyncSession,
        search: str | None,
        tag_ids: list[str] | None,
        category_id: str | None,
        featured: bool | None,
        skip: int,
        limit: int,
    ) -> tuple[list[dict], int]:
        from sqlalchemy.orm import selectinload
        query = (
            select(Document)
            .where(Document.status == DocumentStatusEnum.PUBLIC)
            .options(selectinload(Document.tags).selectinload(DocumentTag.tag), selectinload(Document.category))
        )
        if search:
            query = query.where(
                Document.title.ilike(f"%{search}%") | Document.description.ilike(f"%{search}%")
            )
        if category_id:
            category_scope_ids = await self._get_category_scope_ids(db, category_id)
            if not category_scope_ids:
                return [], 0
            query = query.where(Document.category_id.in_(category_scope_ids))
        if featured is not None:
            query = query.where(Document.featured == featured)
        if tag_ids:
            query = query.join(DocumentTag).where(DocumentTag.tag_id.in_(tag_ids))

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        docs_result = await db.execute(query.order_by(Document.created_at.desc()).offset(skip).limit(limit))
        docs = docs_result.scalars().all()
        return [_doc_to_dict(d) for d in docs], total

    async def get_featured_documents(self, db: AsyncSession) -> list[dict]:
        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(Document)
            .where(Document.featured == True, Document.status == DocumentStatusEnum.PUBLIC)
            .options(selectinload(Document.tags).selectinload(DocumentTag.tag), selectinload(Document.category))
            .order_by(Document.created_at.desc())
            .limit(6)
        )
        docs = result.scalars().all()
        return [_doc_to_dict(d) for d in docs]

    async def get_document(self, db: AsyncSession, doc_id: str) -> dict:
        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(Document)
            .where(Document.id == doc_id, Document.status == DocumentStatusEnum.PUBLIC)
            .options(
                selectinload(Document.tags).selectinload(DocumentTag.tag),
                selectinload(Document.category),
                selectinload(Document.uploaded_by),
            )
        )
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")

        out = _doc_to_dict(doc)
        out["uploaded_by"] = {
            "id": doc.uploaded_by.id,
            "username": doc.uploaded_by.username,
            "full_name": doc.uploaded_by.full_name,
        } if doc.uploaded_by else None

        related_result = await db.execute(
            select(Document)
            .where(
                Document.status == DocumentStatusEnum.PUBLIC,
                Document.category_id == doc.category_id,
                Document.id != doc_id,
            )
            .order_by(Document.downloads.desc())
            .limit(4)
        )
        related = related_result.scalars().all()
        out["related_documents"] = [
            {"id": r.id, "title": r.title, "thumbnail_url": r.thumbnail_url, "downloads": r.downloads}
            for r in related
        ]
        return out

    async def get_preview_file(self, db: AsyncSession, doc_id: str, byte_range: str | None = None) -> dict:
        result = await db.execute(
            select(Document).where(
                Document.id == doc_id,
                Document.status == DocumentStatusEnum.PUBLIC,
            )
        )
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")
        if doc.file_type != FileTypeEnum.PDF:
            raise ValidationError("Preview is only supported for PDF documents")

        try:
            obj = get_r2_object(doc.file_key, byte_range=byte_range)
        except ClientError:
            raise NotFoundError("Preview file not found")

        body = obj["Body"].read()
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Disposition": _content_disposition_inline(f"{doc.title}.pdf"),
            "Cache-Control": "private, no-store, max-age=0",
        }
        if obj.get("ContentRange"):
            headers["Content-Range"] = obj["ContentRange"]

        return {
            "body": body,
            "content_type": obj.get("ContentType", "application/pdf"),
            "content_length": obj.get("ContentLength", len(body)),
            "headers": headers,
            "partial": byte_range is not None and "ContentRange" in obj,
        }

    async def increment_views(self, db: AsyncSession, doc_id: str) -> int:
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")
        doc.views = (doc.views or 0) + 1
        await db.commit()
        return doc.views

    async def get_download_url(self, db: AsyncSession, doc_id: str, user_id: str) -> dict:
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")
        if not doc.allow_download:
            raise ForbiddenError("Download not allowed for this document")

        signed_url = create_r2_signed_url(doc.file_key, 300)
        doc.downloads = (doc.downloads or 0) + 1
        db.add(DocumentDownload(user_id=user_id, document_id=doc.id))
        await db.commit()

        filename = f"{doc.title.lower().replace(' ', '-')}.{doc.file_type.value.lower()}"
        return {"download_url": signed_url, "filename": filename, "file_type": doc.file_type.value}

    async def save_document(self, db: AsyncSession, user_id: str, doc_id: str) -> dict:
        result = await db.execute(select(Document).where(Document.id == doc_id, Document.status == DocumentStatusEnum.PUBLIC))
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")

        existing = await db.execute(
            select(DocumentBookmark).where(
                DocumentBookmark.user_id == user_id,
                DocumentBookmark.document_id == doc_id,
            )
        )
        if existing.scalar_one_or_none():
            raise ConflictError("Document already saved")

        db.add(DocumentBookmark(user_id=user_id, document_id=doc_id))
        await db.commit()
        return {"document_id": doc_id, "saved": True}

    async def unsave_document(self, db: AsyncSession, user_id: str, doc_id: str) -> dict:
        result = await db.execute(
            select(DocumentBookmark).where(
                DocumentBookmark.user_id == user_id,
                DocumentBookmark.document_id == doc_id,
            )
        )
        bookmark = result.scalar_one_or_none()
        if not bookmark:
            raise NotFoundError("Saved document not found")

        await db.delete(bookmark)
        await db.commit()
        return {"document_id": doc_id, "saved": False}

    async def admin_create_document(
        self,
        db: AsyncSession,
        admin_id: str,
        title: str,
        description: str,
        file: UploadFile,
        thumbnail: UploadFile | None,
        tag_ids: list[str],
        category_id: str | None,
        featured: bool,
        allow_download: bool,
        doc_status: str,
    ) -> dict:
        if file.content_type not in ALLOWED_MIMES:
            raise ValidationError("File type not allowed")

        file_data = await file.read()
        file_path = f"documents/{os.urandom(8).hex()}-{file.filename}"
        file_url, file_key = upload_to_r2(file_data, file_path, file.content_type or "application/octet-stream")

        thumbnail_url = None
        thumbnail_key = None
        if thumbnail:
            thumb_data = await thumbnail.read()
            thumbnail_url, thumbnail_key = upload_to_cloudinary(thumb_data, "thumbnails")

        file_type = MIME_TO_FILETYPE.get(file.content_type or "", FileTypeEnum.PDF)

        doc = Document(
            title=title,
            description=description,
            file_url=file_url,
            file_key=file_key,
            file_type=file_type,
            file_size_bytes=len(file_data),
            thumbnail_url=thumbnail_url,
            thumbnail_key=thumbnail_key,
            allow_download=allow_download,
            featured=featured,
            status=DocumentStatusEnum(doc_status),
            uploaded_by_id=admin_id,
            category_id=category_id,
        )
        db.add(doc)
        await db.flush()

        for tag_id in tag_ids:
            db.add(DocumentTag(document_id=doc.id, tag_id=tag_id))

        await db.commit()
        await db.refresh(doc)
        return {"id": doc.id, "title": doc.title, "status": doc.status.value, "file_url": doc.file_url, "thumbnail_url": doc.thumbnail_url}

    async def admin_get_document(self, db: AsyncSession, doc_id: str) -> dict:
        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(Document)
            .where(Document.id == doc_id)
            .options(
                selectinload(Document.tags).selectinload(DocumentTag.tag),
                selectinload(Document.category),
                selectinload(Document.uploaded_by),
            )
        )
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")

        out = _doc_to_dict(doc, expose_file_url=True)
        out["uploaded_by"] = {
            "id": doc.uploaded_by.id,
            "username": doc.uploaded_by.username,
            "full_name": doc.uploaded_by.full_name,
        } if doc.uploaded_by else None
        return out

    async def admin_update_document(
        self,
        db: AsyncSession,
        doc_id: str,
        data: dict,
        file: UploadFile | None,
        thumbnail: UploadFile | None,
    ) -> dict:
        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(Document)
            .where(Document.id == doc_id)
            .options(selectinload(Document.tags).selectinload(DocumentTag.tag), selectinload(Document.category))
        )
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")

        if file:
            file_data = await file.read()
            delete_from_r2(doc.file_key)
            file_path = f"documents/{os.urandom(8).hex()}-{file.filename}"
            doc.file_url, doc.file_key = upload_to_r2(file_data, file_path, file.content_type or "application/octet-stream")
            doc.file_type = MIME_TO_FILETYPE.get(file.content_type or "", FileTypeEnum.PDF)
            doc.file_size_bytes = len(file_data)

        if thumbnail:
            if doc.thumbnail_key:
                delete_from_cloudinary(doc.thumbnail_key)
            thumb_data = await thumbnail.read()
            doc.thumbnail_url, doc.thumbnail_key = upload_to_cloudinary(thumb_data, "thumbnails")

        for k, v in data.items():
            if k == "tag_ids":
                await db.execute(delete(DocumentTag).where(DocumentTag.document_id == doc_id))
                for tag_id in (v or []):
                    db.add(DocumentTag(document_id=doc_id, tag_id=tag_id))
            elif k == "status" and v is not None:
                doc.status = DocumentStatusEnum(v)
            elif v is not None:
                setattr(doc, k, v)

        await db.commit()
        await db.refresh(doc)
        return _doc_to_dict(doc, expose_file_url=True)

    async def admin_toggle_download(self, db: AsyncSession, doc_id: str) -> dict:
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")
        doc.allow_download = not doc.allow_download
        await db.commit()
        return {"id": doc.id, "allow_download": doc.allow_download}

    async def admin_delete_document(self, db: AsyncSession, doc_id: str) -> None:
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")
        try:
            delete_from_r2(doc.file_key)
        except Exception:
            pass
        if doc.thumbnail_key:
            try:
                delete_from_cloudinary(doc.thumbnail_key)
            except Exception:
                pass
        await db.delete(doc)
        await db.commit()

    async def admin_list_documents(
        self, db: AsyncSession, search: str | None, skip: int, limit: int
    ) -> tuple[list[dict], int]:
        from sqlalchemy.orm import selectinload
        query = (
            select(Document)
            .options(selectinload(Document.tags).selectinload(DocumentTag.tag), selectinload(Document.category))
        )
        if search:
            query = query.where(Document.title.ilike(f"%{search}%"))

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        docs_result = await db.execute(query.order_by(Document.created_at.desc()).offset(skip).limit(limit))
        docs = docs_result.scalars().all()
        return [_doc_to_dict(d, expose_file_url=True) for d in docs], total
