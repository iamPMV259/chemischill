import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from database.models import Tag, TagCategoryEnum
from hooks.error import NotFoundError, ConflictError
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)


class TagsService(metaclass=SingletonMeta):

    async def get_all_tags(self, db: AsyncSession) -> list[Tag]:
        result = await db.execute(select(Tag).order_by(Tag.category, Tag.name))
        return result.scalars().all()  # type: ignore

    async def create_tag(self, db: AsyncSession, name: str, name_vi: str, category: str) -> Tag:
        existing = await db.execute(select(Tag).where(or_(Tag.name == name, Tag.name_vi == name_vi)))
        if existing.scalar_one_or_none():
            raise ConflictError("Tag name already exists")
        tag = Tag(name=name, name_vi=name_vi, category=TagCategoryEnum(category))
        db.add(tag)
        await db.commit()
        await db.refresh(tag)
        return tag

    async def update_tag(
        self,
        db: AsyncSession,
        tag_id: str,
        name: str | None,
        name_vi: str | None,
        category: str | None,
    ) -> Tag:
        result = await db.execute(select(Tag).where(Tag.id == tag_id))
        tag = result.scalar_one_or_none()
        if not tag:
            raise NotFoundError("Tag not found")
        if name:
            tag.name = name
        if name_vi:
            tag.name_vi = name_vi
        if category:
            tag.category = TagCategoryEnum(category)
        await db.commit()
        await db.refresh(tag)
        return tag

    async def delete_tag(self, db: AsyncSession, tag_id: str) -> None:
        result = await db.execute(select(Tag).where(Tag.id == tag_id))
        tag = result.scalar_one_or_none()
        if not tag:
            raise NotFoundError("Tag not found")
        await db.delete(tag)
        await db.commit()
