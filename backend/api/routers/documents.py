import json
import logging
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, get_current_user, require_admin
from services.documents import DocumentsService
from utils.pagination import paginate, pagination_params
from database.models import User
from hooks.error import BaseAppException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["documents"])


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/documents")
async def list_documents(
    search: str | None = Query(default=None),
    tag_ids: str | None = Query(default=None),
    category_id: str | None = Query(default=None),
    featured: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, le=100),
    db: AsyncSession = Depends(get_db),
):
    params = pagination_params(page, limit)
    tid_list = tag_ids.split(",") if tag_ids else None
    docs, total = await DocumentsService().list_documents(db, search, tid_list, category_id, featured, params["skip"], params["limit"])
    return {"data": docs, "pagination": paginate(total, params["page"], params["limit"]).model_dump()}


@router.get("/documents/featured")
async def featured_documents(db: AsyncSession = Depends(get_db)):
    return {"data": await DocumentsService().get_featured_documents(db)}


@router.get("/documents/{doc_id}")
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await DocumentsService().get_document(db, doc_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/documents/{doc_id}/view")
async def view_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return {"views": await DocumentsService().increment_views(db, doc_id)}
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await DocumentsService().get_download_url(db, doc_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/admin/documents")
async def admin_list_documents(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = pagination_params(page, limit)
    docs, total = await DocumentsService().admin_list_documents(db, search, params["skip"], params["limit"])
    return {"data": docs, "pagination": paginate(total, params["page"], params["limit"]).model_dump()}


@router.post("/admin/documents", status_code=201)
async def admin_create_document(
    title: str = Form(...),
    description: str = Form(...),
    tag_ids: str = Form(default="[]"),
    category_id: str | None = Form(default=None),
    featured: bool = Form(default=False),
    allow_download: bool = Form(default=False),
    doc_status: str = Form(default="DRAFT", alias="status"),
    file: UploadFile = File(...),
    thumbnail: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    tid_list = json.loads(tag_ids)
    try:
        return await DocumentsService().admin_create_document(
            db, admin.id, title, description, file, thumbnail,
            tid_list, category_id, featured, allow_download, doc_status,
        )
    except BaseAppException as e:
        raise _map_exc(e)


@router.patch("/admin/documents/{doc_id}")
async def admin_update_document(
    doc_id: str,
    title: str | None = Form(default=None),
    description: str | None = Form(default=None),
    tag_ids: str | None = Form(default=None),
    category_id: str | None = Form(default=None),
    featured: bool | None = Form(default=None),
    allow_download: bool | None = Form(default=None),
    doc_status: str | None = Form(default=None, alias="status"),
    file: UploadFile | None = File(default=None),
    thumbnail: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    data: dict = {}
    if title is not None: data["title"] = title
    if description is not None: data["description"] = description
    if tag_ids is not None: data["tag_ids"] = json.loads(tag_ids)
    if category_id is not None: data["category_id"] = category_id
    if featured is not None: data["featured"] = featured
    if allow_download is not None: data["allow_download"] = allow_download
    if doc_status is not None: data["status"] = doc_status
    try:
        return await DocumentsService().admin_update_document(db, doc_id, data, file, thumbnail)
    except BaseAppException as e:
        raise _map_exc(e)


@router.patch("/admin/documents/{doc_id}/toggle-download")
async def toggle_download(doc_id: str, db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    try:
        return await DocumentsService().admin_toggle_download(db, doc_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.delete("/admin/documents/{doc_id}")
async def admin_delete_document(doc_id: str, db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    try:
        await DocumentsService().admin_delete_document(db, doc_id)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"message": "Document deleted"}
