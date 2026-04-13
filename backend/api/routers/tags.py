import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, require_admin
from api.models import CreateTagRequest, UpdateTagRequest
from services.tags import TagsService
from hooks.error import BaseAppException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["tags"])


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


def _tag_out(tag) -> dict:
    name_en = tag.name
    name_vi = tag.name_vi or tag.name
    return {
        "id": tag.id,
        "name": name_vi,
        "name_vi": name_vi,
        "name_en": name_en,
        "category": tag.category.value,
    }


@router.get("/tags")
async def get_tags(db: AsyncSession = Depends(get_db)):
    tags = await TagsService().get_all_tags(db)
    return {"data": [_tag_out(t) for t in tags]}


@router.post("/admin/tags", status_code=201)
async def create_tag(body: CreateTagRequest, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    try:
        tag = await TagsService().create_tag(db, body.name, body.name_vi, body.category)
    except BaseAppException as e:
        raise _map_exc(e)
    return {**_tag_out(tag), "created_at": tag.created_at}


@router.patch("/admin/tags/{tag_id}")
async def update_tag(tag_id: str, body: UpdateTagRequest, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    try:
        tag = await TagsService().update_tag(db, tag_id, body.name, body.name_vi, body.category)
    except BaseAppException as e:
        raise _map_exc(e)
    return _tag_out(tag)


@router.delete("/admin/tags/{tag_id}")
async def delete_tag(tag_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    try:
        await TagsService().delete_tag(db, tag_id)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"message": "Tag deleted"}
