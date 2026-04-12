import logging
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, require_admin
from api.models import CreateCategoryRequest, UpdateCategoryRequest
from services.categories import CategoriesService
from hooks.error import BaseAppException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["categories"])


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


def _cat_out(cat) -> dict:
    return {
        "id": cat.id, "name_vi": cat.name_vi, "name_en": cat.name_en,
        "slug": cat.slug, "parent_id": cat.parent_id,
        "children": [{"id": c.id, "name_vi": c.name_vi, "name_en": c.name_en, "slug": c.slug} for c in cat.children],
    }


@router.get("/categories")
async def get_categories(parent_id: str | None = Query(default=None), db: AsyncSession = Depends(get_db)):
    if parent_id is None:
        cats = await CategoriesService().get_categories(db, top_level=True)
    else:
        cats = await CategoriesService().get_categories(db, parent_id=parent_id, top_level=False)
    return {"data": [_cat_out(c) for c in cats]}


@router.post("/admin/categories", status_code=201)
async def create_category(body: CreateCategoryRequest, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    cat = await CategoriesService().create_category(db, body.name_vi, body.name_en, body.slug, body.parent_id)
    return _cat_out(cat)


@router.patch("/admin/categories/{cat_id}")
async def update_category(
    cat_id: str,
    body: UpdateCategoryRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        cat = await CategoriesService().update_category(db, cat_id, data)
    except BaseAppException as e:
        raise _map_exc(e)
    return _cat_out(cat)


@router.delete("/admin/categories/{cat_id}")
async def delete_category(cat_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    try:
        await CategoriesService().delete_category(db, cat_id)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"message": "Category deleted"}
