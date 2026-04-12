import logging
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.models import User, QuizSubmission, CommunityQuestion, QuestionStatusEnum
from hooks.error import NotFoundError
from utils.storage import upload_to_cloudinary, delete_from_cloudinary
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)


class UsersService(metaclass=SingletonMeta):

    async def _compute_stats(self, db: AsyncSession, user_id: str) -> dict:
        sub_result = await db.execute(
            select(QuizSubmission).where(QuizSubmission.user_id == user_id)
        )
        submissions = sub_result.scalars().all()
        quizzes_completed = len(submissions)
        points = sum(s.score * 10 for s in submissions)

        q_count_result = await db.execute(
            select(func.count(CommunityQuestion.id)).where(
                CommunityQuestion.user_id == user_id,
                CommunityQuestion.status == QuestionStatusEnum.APPROVED,
            )
        )
        questions_posted = q_count_result.scalar() or 0

        rank = 1
        if points > 0:
            higher_result = await db.execute(
                select(QuizSubmission.user_id, func.sum(QuizSubmission.score).label("total"))
                .where(QuizSubmission.user_id != user_id)
                .group_by(QuizSubmission.user_id)
                .having(func.sum(QuizSubmission.score) * 10 > points)
            )
            rank = len(higher_result.all()) + 1

        return {
            "rank": rank,
            "points": points,
            "quizzes_completed": quizzes_completed,
            "questions_posted": questions_posted,
        }

    async def get_me(self, db: AsyncSession, user_id: str) -> dict:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        return {"user": user, "stats": await self._compute_stats(db, user_id)}

    async def update_me(self, db: AsyncSession, user_id: str, data: dict) -> dict:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        for key, val in data.items():
            if val is not None:
                setattr(user, key, val)
        await db.commit()
        await db.refresh(user)
        return {"user": user, "stats": await self._compute_stats(db, user_id)}

    async def update_avatar(self, db: AsyncSession, user_id: str, image_data: bytes) -> str:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")

        if user.avatar_key:
            try:
                delete_from_cloudinary(user.avatar_key)
            except Exception:
                pass

        url, public_id = upload_to_cloudinary(image_data, "avatars", width=200, height=200)
        user.avatar_url = url
        user.avatar_key = public_id
        await db.commit()
        return url

    async def get_public_profile(self, db: AsyncSession, user_id: str) -> dict:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        return {"user": user, "stats": await self._compute_stats(db, user_id)}

    async def get_leaderboard(self, db: AsyncSession, period: str, limit: int) -> dict:
        date_filter = None
        now = datetime.utcnow()
        if period == "weekly":
            date_filter = now - timedelta(days=7)
        elif period == "monthly":
            date_filter = now - timedelta(days=30)

        query = (
            select(
                QuizSubmission.user_id,
                func.count(QuizSubmission.id).label("quizzes"),
                func.sum(QuizSubmission.score).label("total_score"),
            )
            .group_by(QuizSubmission.user_id)
            .order_by(func.sum(QuizSubmission.score).desc())
            .limit(limit)
        )
        if date_filter:
            query = query.where(QuizSubmission.submitted_at >= date_filter)

        rows_result = await db.execute(query)
        rows = rows_result.all()

        user_ids = [r.user_id for r in rows]
        users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        users = {u.id: u for u in users_result.scalars().all()}

        q_result = await db.execute(
            select(CommunityQuestion.user_id, func.count(CommunityQuestion.id).label("cnt"))
            .where(
                CommunityQuestion.user_id.in_(user_ids),
                CommunityQuestion.status == QuestionStatusEnum.APPROVED,
            )
            .group_by(CommunityQuestion.user_id)
        )
        questions_map: dict[str, int] = {r.user_id: r.cnt for r in q_result.all()}

        data = []
        for i, r in enumerate(rows):
            u = users.get(r.user_id)
            data.append({
                "rank": i + 1,
                "user_id": r.user_id,
                "username": u.username if u else "",
                "full_name": u.full_name if u else None,
                "avatar_url": u.avatar_url if u else None,
                "quizzes_completed": r.quizzes,
                "total_score": (r.total_score or 0) * 10,
                "questions_posted": questions_map.get(r.user_id, 0),
            })

        total_active_result = await db.execute(
            select(func.count(User.id)).where(User.status == "ACTIVE")
        )
        total_active = total_active_result.scalar() or 0

        total_part_result = await db.execute(select(func.count(QuizSubmission.id)))
        total_participations = total_part_result.scalar() or 0

        total_q_result = await db.execute(
            select(func.count(CommunityQuestion.id)).where(
                CommunityQuestion.status == QuestionStatusEnum.APPROVED
            )
        )
        total_questions = total_q_result.scalar() or 0

        return {
            "period": period,
            "data": data,
            "summary": {
                "total_active_users": total_active,
                "total_quiz_participations": total_participations,
                "total_questions_posted": total_questions,
            },
        }

    async def admin_list_users(
        self, db: AsyncSession, search: str | None, user_status: str | None, skip: int, limit: int
    ) -> tuple[list, int]:
        query = select(User)
        if search:
            query = query.where(
                User.username.ilike(f"%{search}%") |
                User.full_name.ilike(f"%{search}%") |
                User.phone.ilike(f"%{search}%")
            )
        if user_status:
            query = query.where(User.status == user_status)

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        users_result = await db.execute(
            query.order_by(User.created_at.desc()).offset(skip).limit(limit)
        )
        users = users_result.scalars().all()

        result = []
        for u in users:
            sub_result = await db.execute(
                select(QuizSubmission).where(QuizSubmission.user_id == u.id)
            )
            submissions = sub_result.scalars().all()
            qp_result = await db.execute(
                select(func.count(CommunityQuestion.id)).where(
                    CommunityQuestion.user_id == u.id,
                    CommunityQuestion.status == QuestionStatusEnum.APPROVED,
                )
            )
            qp = qp_result.scalar() or 0
            result.append({
                "user": u,
                "stats": {
                    "rank": 0,
                    "points": sum(s.score * 10 for s in submissions),
                    "quizzes_completed": len(submissions),
                    "questions_posted": qp,
                },
            })
        return result, total

    async def admin_update_user_status(self, db: AsyncSession, user_id: str, new_status: str) -> User:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        user.status = new_status  # type: ignore
        await db.commit()
        await db.refresh(user)
        return user
