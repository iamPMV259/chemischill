import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import UploadFile
from database.models import (
    CommunityQuestion, CommunityQuestionImage, CommunityQuestionTag,
    CommunityAnswer, CommunityAnswerImage, AnswerUpvote,
    QuestionStatusEnum, Document, Quiz, QuizSubmission, User,
)
from hooks.error import NotFoundError, ValidationError
from utils.storage import upload_to_cloudinary
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)

_QUESTION_OPTIONS = [
    selectinload(CommunityQuestion.user),
    selectinload(CommunityQuestion.tags).selectinload(CommunityQuestionTag.tag),
    selectinload(CommunityQuestion.images),
    selectinload(CommunityQuestion.answers),
]


def _question_to_dict(q: CommunityQuestion, answer_count: int | None = None) -> dict:
    cnt = answer_count if answer_count is not None else len(q.answers)
    return {
        "id": q.id,
        "title": q.title,
        "content": q.content,
        "status": q.status.value,
        "admin_note": q.admin_note,
        "created_at": q.created_at,
        "answer_count": cnt,
        "user": {
            "id": q.user.id,
            "username": q.user.username,
            "full_name": q.user.full_name,
            "avatar_url": q.user.avatar_url,
        },
        "tags": [{"id": t.tag.id, "name": t.tag.name} for t in q.tags],
        "images": [{"image_url": img.image_url, "order_index": img.order_index} for img in q.images],
    }


class CommunityService(metaclass=SingletonMeta):

    async def list_questions(
        self, db: AsyncSession, search: str | None, tag_ids: list[str] | None, skip: int, limit: int
    ) -> tuple[list[dict], int]:
        query = (
            select(CommunityQuestion)
            .where(CommunityQuestion.status == QuestionStatusEnum.APPROVED)
            .options(*_QUESTION_OPTIONS)
        )
        if search:
            query = query.where(
                CommunityQuestion.title.ilike(f"%{search}%") |
                CommunityQuestion.content.ilike(f"%{search}%")
            )
        if tag_ids:
            query = query.join(CommunityQuestionTag).where(CommunityQuestionTag.tag_id.in_(tag_ids))

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        questions_result = await db.execute(
            query.order_by(CommunityQuestion.created_at.desc()).offset(skip).limit(limit)
        )
        questions = questions_result.scalars().all()
        return [_question_to_dict(q) for q in questions], total

    async def get_question(self, db: AsyncSession, question_id: str) -> dict:
        result = await db.execute(
            select(CommunityQuestion)
            .where(
                CommunityQuestion.id == question_id,
                CommunityQuestion.status == QuestionStatusEnum.APPROVED,
            )
            .options(*_QUESTION_OPTIONS)
        )
        q = result.scalar_one_or_none()
        if not q:
            raise NotFoundError("Question not found")
        return _question_to_dict(q)

    async def list_answers(
        self,
        db: AsyncSession,
        question_id: str,
        current_user_id: str | None,
        sort_by: str,
        skip: int,
        limit: int,
    ) -> tuple[list[dict], int]:
        q_result = await db.execute(
            select(CommunityQuestion).where(
                CommunityQuestion.id == question_id,
                CommunityQuestion.status == QuestionStatusEnum.APPROVED,
            )
        )
        if not q_result.scalar_one_or_none():
            raise NotFoundError("Question not found")

        query = (
            select(CommunityAnswer)
            .where(CommunityAnswer.question_id == question_id)
            .options(
                selectinload(CommunityAnswer.user),
                selectinload(CommunityAnswer.images),
            )
        )
        if sort_by == "newest":
            query = query.order_by(CommunityAnswer.created_at.desc())
        else:
            query = query.order_by(CommunityAnswer.upvotes.desc())

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        answers_result = await db.execute(query.offset(skip).limit(limit))
        answers = answers_result.scalars().all()

        upvoted_ids: set[str] = set()
        if current_user_id and answers:
            upvoted_result = await db.execute(
                select(AnswerUpvote.answer_id).where(
                    AnswerUpvote.user_id == current_user_id,
                    AnswerUpvote.answer_id.in_([a.id for a in answers]),
                )
            )
            upvoted_ids = {r.answer_id for r in upvoted_result.all()}

        result = []
        for a in answers:
            result.append({
                "id": a.id,
                "content": a.content,
                "upvotes": a.upvotes,
                "is_upvoted_by_me": a.id in upvoted_ids,
                "created_at": a.created_at,
                "user": {"id": a.user.id, "username": a.user.username, "full_name": a.user.full_name, "avatar_url": a.user.avatar_url},
                "images": [{"image_url": img.image_url, "order_index": img.order_index} for img in a.images],
            })
        return result, total

    async def create_question(
        self,
        db: AsyncSession,
        user_id: str,
        title: str,
        content: str,
        tag_ids: list[str],
        image_files: list[UploadFile],
    ) -> dict:
        q = CommunityQuestion(user_id=user_id, title=title, content=content, status=QuestionStatusEnum.PENDING)
        db.add(q)
        await db.flush()

        for tag_id in tag_ids:
            db.add(CommunityQuestionTag(question_id=q.id, tag_id=tag_id))

        for i, img_file in enumerate(image_files):
            data = await img_file.read()
            url, key = upload_to_cloudinary(data, "question-images")
            db.add(CommunityQuestionImage(question_id=q.id, image_url=url, image_key=key, order_index=i))

        await db.commit()
        return {
            "id": q.id,
            "title": q.title,
            "status": q.status.value,
            "message": "Question submitted for review. Admin will approve it within 24 hours.",
        }

    async def create_answer(
        self,
        db: AsyncSession,
        user_id: str,
        question_id: str,
        content: str,
        image_files: list[UploadFile],
    ) -> dict:
        q_result = await db.execute(
            select(CommunityQuestion).where(
                CommunityQuestion.id == question_id,
                CommunityQuestion.status == QuestionStatusEnum.APPROVED,
            )
        )
        if not q_result.scalar_one_or_none():
            raise NotFoundError("Question not found")

        answer = CommunityAnswer(question_id=question_id, user_id=user_id, content=content)
        db.add(answer)
        await db.flush()

        for i, img_file in enumerate(image_files):
            data = await img_file.read()
            url, key = upload_to_cloudinary(data, "answer-images")
            db.add(CommunityAnswerImage(answer_id=answer.id, image_url=url, image_key=key, order_index=i))

        await db.commit()
        await db.refresh(answer)

        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        return {
            "id": answer.id,
            "content": answer.content,
            "upvotes": answer.upvotes,
            "is_upvoted_by_me": False,
            "created_at": answer.created_at,
            "user": {"id": user.id, "username": user.username, "full_name": user.full_name, "avatar_url": user.avatar_url} if user else {},
            "images": [],
        }

    async def upvote_answer(self, db: AsyncSession, user_id: str, answer_id: str) -> dict:
        result = await db.execute(select(CommunityAnswer).where(CommunityAnswer.id == answer_id))
        answer = result.scalar_one_or_none()
        if not answer:
            raise NotFoundError("Answer not found")

        existing = await db.execute(
            select(AnswerUpvote).where(
                AnswerUpvote.user_id == user_id,
                AnswerUpvote.answer_id == answer_id,
            )
        )
        if not existing.scalar_one_or_none():
            db.add(AnswerUpvote(user_id=user_id, answer_id=answer_id))
            answer.upvotes = (answer.upvotes or 0) + 1
            await db.commit()

        return {"answer_id": answer.id, "upvotes": answer.upvotes, "is_upvoted_by_me": True}

    async def remove_upvote(self, db: AsyncSession, user_id: str, answer_id: str) -> dict:
        upvote_result = await db.execute(
            select(AnswerUpvote).where(
                AnswerUpvote.user_id == user_id,
                AnswerUpvote.answer_id == answer_id,
            )
        )
        upvote = upvote_result.scalar_one_or_none()
        if not upvote:
            raise ValidationError("You have not upvoted this answer")

        answer_result = await db.execute(select(CommunityAnswer).where(CommunityAnswer.id == answer_id))
        answer = answer_result.scalar_one_or_none()
        await db.delete(upvote)
        if answer:
            answer.upvotes = max(0, (answer.upvotes or 0) - 1)
        await db.commit()
        return {"answer_id": answer_id, "upvotes": answer.upvotes if answer else 0, "is_upvoted_by_me": False}

    async def admin_list_questions(
        self, db: AsyncSession, q_status: str | None, skip: int, limit: int
    ) -> tuple[list[dict], int, dict]:
        query = select(CommunityQuestion).options(*_QUESTION_OPTIONS)
        if q_status:
            query = query.where(CommunityQuestion.status == QuestionStatusEnum(q_status))

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        questions_result = await db.execute(
            query.order_by(CommunityQuestion.created_at.desc()).offset(skip).limit(limit)
        )
        questions = questions_result.scalars().all()

        counts_result = await db.execute(
            select(CommunityQuestion.status, func.count(CommunityQuestion.id))
            .group_by(CommunityQuestion.status)
        )
        counts = {s.value: 0 for s in QuestionStatusEnum}
        for s, c in counts_result.all():
            counts[s.value] = c

        return [_question_to_dict(q) for q in questions], total, counts

    async def admin_review_question(
        self, db: AsyncSession, question_id: str, reviewer_id: str, new_status: str, admin_note: str | None = None
    ) -> dict:
        result = await db.execute(
            select(CommunityQuestion).where(CommunityQuestion.id == question_id)
        )
        q = result.scalar_one_or_none()
        if not q:
            raise NotFoundError("Question not found")
        q.status = QuestionStatusEnum(new_status)
        q.reviewed_by_id = reviewer_id
        q.reviewed_at = datetime.utcnow()
        if admin_note is not None:
            q.admin_note = admin_note
        await db.commit()
        return {"id": q.id, "status": q.status.value, "reviewed_at": q.reviewed_at, "admin_note": q.admin_note}

    async def get_admin_stats(self, db: AsyncSession) -> dict:
        total_docs = (await db.execute(select(func.count(Document.id)))).scalar() or 0
        published_docs = (await db.execute(
            select(func.count(Document.id)).where(Document.status == "PUBLIC")
        )).scalar() or 0
        published_quizzes = (await db.execute(
            select(func.count(Quiz.id)).where(Quiz.is_published == True)
        )).scalar() or 0
        draft_quizzes = (await db.execute(
            select(func.count(Quiz.id)).where(Quiz.is_published == False)
        )).scalar() or 0
        pending_q = (await db.execute(
            select(func.count(CommunityQuestion.id)).where(CommunityQuestion.status == QuestionStatusEnum.PENDING)
        )).scalar() or 0
        total_q = (await db.execute(select(func.count(CommunityQuestion.id)))).scalar() or 0
        total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
        active_users = (await db.execute(
            select(func.count(User.id)).where(User.status == "ACTIVE")
        )).scalar() or 0
        total_submissions = (await db.execute(select(func.count(QuizSubmission.id)))).scalar() or 0
        total_downloads = (await db.execute(select(func.sum(Document.downloads)))).scalar() or 0

        now = datetime.utcnow()
        download_months = []
        for i in range(5, -1, -1):
            from calendar import month_abbr
            month = (now.month - i - 1) % 12 + 1
            download_months.append({"month": month_abbr[month], "count": 0})

        quiz_weeks = [{"week": f"Week {i}", "count": 0} for i in range(1, 5)]

        return {
            "total_documents": total_docs,
            "total_published_documents": published_docs,
            "total_published_quizzes": published_quizzes,
            "total_draft_quizzes": draft_quizzes,
            "pending_questions": pending_q,
            "total_community_questions": total_q,
            "total_users": total_users,
            "active_users": active_users,
            "total_quiz_submissions": total_submissions,
            "total_document_downloads": total_downloads,
            "charts": {"downloads": download_months, "quiz_participations": quiz_weeks},
        }
