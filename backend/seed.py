"""
Seed script: tạo tags, categories và admin user mẫu.

Chạy: python seed.py
"""
import asyncio
import sys
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from clients.databases import get_session_factory
from database.models import Tag, Category, User, TagCategoryEnum, RoleEnum
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    factory = get_session_factory()
    async with factory() as db:
        try:
            # ── Tags ──────────────────────────────────────────────────────────────
            tags_data = [
                ("Organic Chemistry", "Hóa hữu cơ", TagCategoryEnum.TOPIC),
                ("Electrochemistry", "Điện hóa học", TagCategoryEnum.TOPIC),
                ("Thermochemistry", "Nhiệt hóa học", TagCategoryEnum.TOPIC),
                ("Inorganic Chemistry", "Hóa vô cơ", TagCategoryEnum.TOPIC),
                ("Analytical Chemistry", "Hóa phân tích", TagCategoryEnum.TOPIC),
                ("Grade 10", "Lớp 10", TagCategoryEnum.GRADE),
                ("Grade 11", "Lớp 11", TagCategoryEnum.GRADE),
                ("Grade 12", "Lớp 12", TagCategoryEnum.GRADE),
                ("Easy", "Dễ", TagCategoryEnum.DIFFICULTY),
                ("Advanced Exercises", "Bài tập nâng cao", TagCategoryEnum.DIFFICULTY),
            ]

            created_tags = 0
            updated_tags = 0
            for name_en, name_vi, category in tags_data:
                result = await db.execute(select(Tag).where(Tag.name == name_en))
                existing_tag = result.scalar_one_or_none()
                if not existing_tag:
                    db.add(Tag(name=name_en, name_vi=name_vi, category=category))
                    created_tags += 1
                else:
                    needs_update = (
                        existing_tag.name_vi in (None, "", existing_tag.name)
                        or existing_tag.category != category
                    )
                    if needs_update:
                        existing_tag.name_vi = name_vi
                        existing_tag.category = category
                        updated_tags += 1
            await db.flush()
            print(f"  Tags: {created_tags} created, {updated_tags} updated")

            # ── Document tag tree (Category) ────────────────────────────────────
            async def ensure_category(slug: str, name_vi: str, name_en: str, parent_id: str | None = None):
                result = await db.execute(select(Category).where(Category.slug == slug))
                category = result.scalar_one_or_none()
                if not category:
                    category = Category(name_vi=name_vi, name_en=name_en, slug=slug, parent_id=parent_id)
                    db.add(category)
                    await db.flush()
                else:
                    category.name_vi = name_vi
                    category.name_en = name_en
                    category.parent_id = parent_id
                return category

            general_root = await ensure_category("general-chemistry", "Hóa thường", "General Chemistry")
            advanced_root = await ensure_category("specialized-chemistry", "Hóa chuyên", "Specialized Chemistry")

            for grade in range(6, 13):
                await ensure_category(f"grade-{grade}", f"Lớp {grade}", f"Grade {grade}", general_root.id)

            inorganic = await ensure_category("inorganic", "Hóa vô cơ", "Inorganic Chemistry", advanced_root.id)
            organic = await ensure_category("organic", "Hóa hữu cơ", "Organic Chemistry", advanced_root.id)

            await ensure_category("organic-reactions", "Phản ứng hữu cơ", "Organic Reactions", organic.id)
            await ensure_category("analytical", "Hóa phân tích", "Analytical Chemistry", inorganic.id)

            print("  Categories: seeded")

            # ── Admin user ────────────────────────────────────────────────────────
            admin_result = await db.execute(select(User).where(User.email == "admin@chemischill.vn"))
            if not admin_result.scalar_one_or_none():
                db.add(User(
                    email="admin@chemischill.vn",
                    username="admin",
                    full_name="ChemisChill Admin",
                    password_hash=pwd_context.hash("Admin@123456"),
                    role=RoleEnum.ADMIN,
                ))
                print("  Admin: admin@chemischill.vn / Admin@123456")
            else:
                print("  Admin: already exists")

            await db.commit()
            print("Seed complete!")

        except Exception as e:
            await db.rollback()
            print(f"Seed failed: {e}")
            sys.exit(1)


if __name__ == "__main__":
    print("Seeding database...")
    asyncio.run(seed())
