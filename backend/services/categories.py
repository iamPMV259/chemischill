import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from database.models import Category, Document
from hooks.error import NotFoundError
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)

_CAT_OPTIONS = [selectinload(Category.children)]


class CategoriesService(metaclass=SingletonMeta):

    async def get_categories(
        self, db: AsyncSession, parent_id: str | None = None, top_level: bool = True
    ) -> list[Category]:
        if top_level:
            result = await db.execute(
                select(Category).where(Category.parent_id.is_(None)).options(*_CAT_OPTIONS).order_by(Category.name_en)
            )
        else:
            result = await db.execute(
                select(Category).where(Category.parent_id == parent_id).options(*_CAT_OPTIONS).order_by(Category.name_en)
            )
        return result.scalars().all()  # type: ignore

    async def create_category(
        self, db: AsyncSession, name_vi: str, name_en: str, slug: str, parent_id: str | None
    ) -> Category:
        cat = Category(name_vi=name_vi, name_en=name_en, slug=slug, parent_id=parent_id)
        db.add(cat)
        await db.commit()
        result = await db.execute(
            select(Category).where(Category.id == cat.id).options(*_CAT_OPTIONS)
        )
        return result.scalar_one()

    async def update_category(self, db: AsyncSession, cat_id: str, data: dict) -> Category:
        result = await db.execute(
            select(Category).where(Category.id == cat_id).options(*_CAT_OPTIONS)
        )
        cat = result.scalar_one_or_none()
        if not cat:
            raise NotFoundError("Category not found")
        for k, v in data.items():
            if v is not None:
                setattr(cat, k, v)
        await db.commit()
        result = await db.execute(
            select(Category).where(Category.id == cat_id).options(*_CAT_OPTIONS)
        )
        return result.scalar_one()

    async def delete_category(self, db: AsyncSession, cat_id: str) -> None:
        result = await db.execute(select(Category).where(Category.id == cat_id))
        cat = result.scalar_one_or_none()
        if not cat:
            raise NotFoundError("Category not found")
        await db.execute(
            update(Category).where(Category.parent_id == cat_id).values(parent_id=None)
        )
        await db.execute(
            update(Document).where(Document.category_id == cat_id).values(category_id=None)
        )
        await db.delete(cat)
        await db.commit()
