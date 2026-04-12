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
                ("Organic Chemistry", TagCategoryEnum.TOPIC),
                ("Electrochemistry", TagCategoryEnum.TOPIC),
                ("Thermochemistry", TagCategoryEnum.TOPIC),
                ("Inorganic Chemistry", TagCategoryEnum.TOPIC),
                ("Analytical Chemistry", TagCategoryEnum.TOPIC),
                ("Grade 10", TagCategoryEnum.GRADE),
                ("Grade 11", TagCategoryEnum.GRADE),
                ("Grade 12", TagCategoryEnum.GRADE),
                ("Easy", TagCategoryEnum.DIFFICULTY),
                ("Advanced Exercises", TagCategoryEnum.DIFFICULTY),
            ]

            created_tags = 0
            for name, category in tags_data:
                result = await db.execute(select(Tag).where(Tag.name == name))
                if not result.scalar_one_or_none():
                    db.add(Tag(name=name, category=category))
                    created_tags += 1
            await db.flush()
            print(f"  Tags: {created_tags} created")

            # ── Categories ────────────────────────────────────────────────────────
            organic_result = await db.execute(select(Category).where(Category.slug == "organic"))
            organic = organic_result.scalar_one_or_none()
            if not organic:
                organic = Category(name_vi="Hóa Hữu Cơ", name_en="Organic Chemistry", slug="organic")
                db.add(organic)
                await db.flush()

            inorganic_result = await db.execute(select(Category).where(Category.slug == "inorganic"))
            if not inorganic_result.scalar_one_or_none():
                db.add(Category(name_vi="Hóa Vô Cơ", name_en="Inorganic Chemistry", slug="inorganic"))

            orgreact_result = await db.execute(select(Category).where(Category.slug == "organic-reactions"))
            if not orgreact_result.scalar_one_or_none():
                db.add(Category(
                    name_vi="Phản Ứng Hữu Cơ",
                    name_en="Organic Reactions",
                    slug="organic-reactions",
                    parent_id=organic.id,
                ))

            analytical_result = await db.execute(select(Category).where(Category.slug == "analytical"))
            if not analytical_result.scalar_one_or_none():
                db.add(Category(name_vi="Hóa Phân Tích", name_en="Analytical Chemistry", slug="analytical"))

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
