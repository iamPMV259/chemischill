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


@router.get("/tags")
async def get_tags(db: AsyncSession = Depends(get_db)):
    tags = await TagsService().get_all_tags(db)
    return {"data": [{"id": t.id, "name": t.name, "category": t.category.value} for t in tags]}


@router.post("/admin/tags", status_code=201)
async def create_tag(body: CreateTagRequest, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    try:
        tag = await TagsService().create_tag(db, body.name, body.category)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"id": tag.id, "name": tag.name, "category": tag.category.value, "created_at": tag.created_at}


@router.patch("/admin/tags/{tag_id}")
async def update_tag(tag_id: str, body: UpdateTagRequest, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    try:
        tag = await TagsService().update_tag(db, tag_id, body.name, body.category)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"id": tag.id, "name": tag.name, "category": tag.category.value}


@router.delete("/admin/tags/{tag_id}")
async def delete_tag(tag_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    try:
        await TagsService().delete_tag(db, tag_id)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"message": "Tag deleted"}
