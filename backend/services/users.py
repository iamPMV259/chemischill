import logging
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database.models import (
    User, QuizSubmission, QuizSubmissionAnswer, Quiz, QuizQuestion,
    CommunityQuestion, CommunityQuestionTag, QuestionStatusEnum,
    DocumentBookmark, DocumentDownload, Document, DocumentTag,
)
from hooks.error import NotFoundError
from utils.storage import upload_to_cloudinary, delete_from_cloudinary
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)


class UsersService(metaclass=SingletonMeta):

    def _aggregate_quiz_points(self, submissions: list[QuizSubmission]) -> tuple[int, int]:
        quizzes_completed = len({submission.quiz_id for submission in submissions})
        grouped: dict[str, list[QuizSubmission]] = {}
        for submission in submissions:
            grouped.setdefault(submission.quiz_id, []).append(submission)

        points = 0
        for quiz_submissions in grouped.values():
            quiz = quiz_submissions[0].quiz
            if quiz and quiz.count_points_once:
                points += max((submission.awarded_points or 0) for submission in quiz_submissions)
            else:
                points += sum((submission.awarded_points or 0) for submission in quiz_submissions)

        return quizzes_completed, points

    async def _compute_stats(self, db: AsyncSession, user_id: str) -> dict:
        sub_result = await db.execute(
            select(QuizSubmission)
            .where(QuizSubmission.user_id == user_id)
            .options(selectinload(QuizSubmission.quiz))
        )
        submissions = sub_result.scalars().all()
        quizzes_completed, points = self._aggregate_quiz_points(submissions)

        q_count_result = await db.execute(
            select(func.count(CommunityQuestion.id)).where(
                CommunityQuestion.user_id == user_id,
                CommunityQuestion.status == QuestionStatusEnum.APPROVED,
            )
        )
        questions_posted = q_count_result.scalar() or 0

        rank = 1
        if points > 0:
            all_submissions_result = await db.execute(
                select(QuizSubmission)
                .where(QuizSubmission.user_id != user_id)
                .options(selectinload(QuizSubmission.quiz))
            )
            other_submissions = all_submissions_result.scalars().all()
            grouped_users: dict[str, list[QuizSubmission]] = {}
            for submission in other_submissions:
                grouped_users.setdefault(submission.user_id, []).append(submission)
            higher_users = 0
            for user_submissions in grouped_users.values():
                _, user_points = self._aggregate_quiz_points(user_submissions)
                if user_points > points:
                    higher_users += 1
            rank = higher_users + 1

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

        query = select(QuizSubmission).options(selectinload(QuizSubmission.quiz))
        if date_filter:
            query = query.where(QuizSubmission.submitted_at >= date_filter)
        submissions_result = await db.execute(query)
        submissions = submissions_result.scalars().all()

        per_user: dict[str, list[QuizSubmission]] = {}
        for submission in submissions:
            per_user.setdefault(submission.user_id, []).append(submission)

        ranked_rows = []
        for user_id, user_submissions in per_user.items():
            quizzes_completed, total_points = self._aggregate_quiz_points(user_submissions)
            ranked_rows.append({
                "user_id": user_id,
                "quizzes_completed": quizzes_completed,
                "total_score": total_points,
            })
        ranked_rows.sort(key=lambda item: item["total_score"], reverse=True)
        ranked_rows = ranked_rows[:limit]

        user_ids = [r["user_id"] for r in ranked_rows]
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
        for i, r in enumerate(ranked_rows):
            u = users.get(r["user_id"])
            data.append({
                "rank": i + 1,
                "user_id": r["user_id"],
                "username": u.username if u else "",
                "full_name": u.full_name if u else None,
                "avatar_url": u.avatar_url if u else None,
                "quizzes_completed": r["quizzes_completed"],
                "total_score": r["total_score"],
                "questions_posted": questions_map.get(r["user_id"], 0),
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
                select(QuizSubmission).where(QuizSubmission.user_id == u.id).options(selectinload(QuizSubmission.quiz))
            )
            submissions = sub_result.scalars().all()
            quizzes_completed, points = self._aggregate_quiz_points(submissions)
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
                    "points": points,
                    "quizzes_completed": quizzes_completed,
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

    async def get_saved_documents(self, db: AsyncSession, user_id: str) -> list[dict]:
        from services.documents import _doc_to_dict

        result = await db.execute(
            select(DocumentBookmark)
            .where(DocumentBookmark.user_id == user_id)
            .options(
                selectinload(DocumentBookmark.document)
                .selectinload(Document.tags)
                .selectinload(DocumentTag.tag),
                selectinload(DocumentBookmark.document).selectinload(Document.category),
            )
            .order_by(DocumentBookmark.created_at.desc())
        )
        bookmarks = result.scalars().all()
        data = []
        for bookmark in bookmarks:
            if bookmark.document:
                row = _doc_to_dict(bookmark.document)
                row["saved_at"] = bookmark.created_at
                data.append(row)
        return data

    async def get_download_history(self, db: AsyncSession, user_id: str, limit: int = 50) -> list[dict]:
        result = await db.execute(
            select(DocumentDownload)
            .where(DocumentDownload.user_id == user_id)
            .options(
                selectinload(DocumentDownload.document)
                .selectinload(Document.tags)
                .selectinload(DocumentTag.tag),
                selectinload(DocumentDownload.document).selectinload(Document.category),
            )
            .order_by(DocumentDownload.created_at.desc())
            .limit(limit)
        )
        rows = result.scalars().all()
        return [
            {
                "downloaded_at": row.created_at,
                "document": {
                    "id": row.document.id,
                    "title": row.document.title,
                    "description": row.document.description,
                    "thumbnail_url": row.document.thumbnail_url,
                    "file_type": row.document.file_type.value,
                    "allow_download": row.document.allow_download,
                    "views": row.document.views,
                    "downloads": row.document.downloads,
                    "created_at": row.document.created_at,
                    "tags": [
                        {
                            "id": dt.tag.id,
                            "name": dt.tag.name_vi or dt.tag.name,
                            "name_vi": dt.tag.name_vi or dt.tag.name,
                            "name_en": dt.tag.name,
                            "category": dt.tag.category.value,
                        }
                        for dt in row.document.tags
                    ],
                },
            }
            for row in rows if row.document
        ]

    async def get_quiz_history(self, db: AsyncSession, user_id: str, limit: int = 50) -> list[dict]:
        result = await db.execute(
            select(QuizSubmission)
            .where(QuizSubmission.user_id == user_id)
            .options(
                selectinload(QuizSubmission.quiz),
                selectinload(QuizSubmission.answers).selectinload(QuizSubmissionAnswer.question),
                selectinload(QuizSubmission.answers).selectinload(QuizSubmissionAnswer.selected_option),
            )
            .order_by(QuizSubmission.submitted_at.desc())
            .limit(limit)
        )
        submissions = result.scalars().all()
        data = []
        for submission in submissions:
            if not submission.quiz:
                continue
            data.append({
                "submission_id": submission.id,
                "submitted_at": submission.submitted_at,
                "score": submission.score,
                "awarded_points": submission.awarded_points,
                "attempt_number": submission.attempt_number,
                "total_questions": submission.total_questions,
                "percentage": round(submission.score / submission.total_questions * 100) if submission.total_questions else 0,
                "time_taken_secs": submission.time_taken_secs,
                "quiz": {
                    "id": submission.quiz.id,
                    "title": submission.quiz.title,
                    "description": submission.quiz.description,
                    "topic": submission.quiz.topic,
                    "difficulty": submission.quiz.difficulty.value,
                },
            })
        return data

    async def get_my_questions(self, db: AsyncSession, user_id: str, include_unapproved: bool = True, limit: int = 50) -> list[dict]:
        query = (
            select(CommunityQuestion)
            .where(CommunityQuestion.user_id == user_id)
            .options(
                selectinload(CommunityQuestion.user),
                selectinload(CommunityQuestion.tags).selectinload(CommunityQuestionTag.tag),
                selectinload(CommunityQuestion.images),
                selectinload(CommunityQuestion.answers),
            )
            .order_by(CommunityQuestion.created_at.desc())
            .limit(limit)
        )
        if not include_unapproved:
            query = query.where(CommunityQuestion.status == QuestionStatusEnum.APPROVED)

        result = await db.execute(query)
        questions = result.scalars().all()
        from services.community import _question_to_dict
        return [_question_to_dict(question) for question in questions]

    async def get_public_activity(self, db: AsyncSession, user_id: str, limit: int = 20) -> dict:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")

        recent_submissions_result = await db.execute(
            select(QuizSubmission)
            .where(QuizSubmission.user_id == user_id)
            .options(selectinload(QuizSubmission.quiz))
            .order_by(QuizSubmission.submitted_at.desc())
            .limit(limit)
        )
        recent_submissions = recent_submissions_result.scalars().all()

        approved_questions = await self.get_my_questions(db, user_id, include_unapproved=False, limit=limit)

        return {
            "user_id": user.id,
            "quiz_history": [
                {
                    "submission_id": submission.id,
                    "submitted_at": submission.submitted_at,
                    "score": submission.score,
                    "awarded_points": submission.awarded_points,
                    "attempt_number": submission.attempt_number,
                    "total_questions": submission.total_questions,
                    "quiz": {
                        "id": submission.quiz.id,
                        "title": submission.quiz.title,
                        "topic": submission.quiz.topic,
                    } if submission.quiz else None,
                }
                for submission in recent_submissions
            ],
            "questions": approved_questions,
        }
