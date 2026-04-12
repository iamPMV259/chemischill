import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from database.models import (
    Quiz, QuizQuestion, QuizOption, QuizTag, QuizSubmission, QuizSubmissionAnswer,
    DifficultyEnum,
)
from hooks.error import NotFoundError, ValidationError
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)


def _quiz_to_dict(quiz: Quiz) -> dict:
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "topic": quiz.topic,
        "time_limit": quiz.time_limit,
        "difficulty": quiz.difficulty.value,
        "is_published": quiz.is_published,
        "has_reward": quiz.has_reward,
        "reward_description": quiz.reward_description,
        "participants_count": quiz.participants_count,
        "question_count": len(quiz.questions),
        "tags": [{"id": qt.tag.id, "name": qt.tag.name, "category": qt.tag.category.value} for qt in quiz.tags],
        "created_at": quiz.created_at,
    }


_QUIZ_OPTIONS = [
    selectinload(Quiz.questions).selectinload(QuizQuestion.options),
    selectinload(Quiz.tags).selectinload(QuizTag.tag),
    selectinload(Quiz.submissions),
]


class QuizzesService(metaclass=SingletonMeta):

    async def list_quizzes(
        self,
        db: AsyncSession,
        search: str | None,
        difficulty: str | None,
        tag_ids: list[str] | None,
        has_reward: bool | None,
        skip: int,
        limit: int,
    ) -> tuple[list[dict], int]:
        query = (
            select(Quiz)
            .where(Quiz.is_published == True)
            .options(*_QUIZ_OPTIONS)
        )
        if search:
            query = query.where(Quiz.title.ilike(f"%{search}%") | Quiz.topic.ilike(f"%{search}%"))
        if difficulty:
            query = query.where(Quiz.difficulty == DifficultyEnum(difficulty))
        if has_reward is not None:
            query = query.where(Quiz.has_reward == has_reward)
        if tag_ids:
            query = query.join(QuizTag).where(QuizTag.tag_id.in_(tag_ids))

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        quizzes_result = await db.execute(query.order_by(Quiz.created_at.desc()).offset(skip).limit(limit))
        quizzes = quizzes_result.scalars().all()
        return [_quiz_to_dict(q) for q in quizzes], total

    async def get_featured_quizzes(self, db: AsyncSession) -> list[dict]:
        result = await db.execute(
            select(Quiz)
            .where(Quiz.is_published == True)
            .options(*_QUIZ_OPTIONS)
            .order_by(Quiz.participants_count.desc())
            .limit(3)
        )
        return [_quiz_to_dict(q) for q in result.scalars().all()]

    async def get_quiz_for_taking(self, db: AsyncSession, quiz_id: str) -> dict:
        result = await db.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id, Quiz.is_published == True)
            .options(*_QUIZ_OPTIONS)
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("Quiz not found")

        return {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "time_limit": quiz.time_limit,
            "difficulty": quiz.difficulty.value,
            "has_reward": quiz.has_reward,
            "question_count": len(quiz.questions),
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "question_image_url": q.question_image_url,
                    "order_index": q.order_index,
                    "options": [
                        {"id": o.id, "option_text": o.option_text, "order_index": o.order_index}
                        for o in q.options
                    ],
                }
                for q in quiz.questions
            ],
        }

    async def submit_quiz(
        self,
        db: AsyncSession,
        user_id: str,
        quiz_id: str,
        answers: list[dict],
        time_taken_secs: int | None,
    ) -> dict:
        result = await db.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id, Quiz.is_published == True)
            .options(*_QUIZ_OPTIONS)
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("Quiz not found")

        question_map = {q.id: q for q in quiz.questions}
        option_map = {o.id: o for q in quiz.questions for o in q.options}

        for ans in answers:
            if ans["question_id"] not in question_map:
                raise ValidationError(f"Question {ans['question_id']} not in this quiz")
            if ans.get("selected_option_id") and ans["selected_option_id"] not in option_map:
                raise ValidationError(f"Option {ans['selected_option_id']} not in this quiz")

        results = []
        for ans in answers:
            q = question_map[ans["question_id"]]
            selected_opt = option_map.get(ans.get("selected_option_id", ""))
            correct_opt = next((o for o in q.options if o.is_correct), None)
            is_correct = bool(selected_opt and selected_opt.is_correct)
            results.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "selected_option_id": ans.get("selected_option_id"),
                "correct_option_id": correct_opt.id if correct_opt else None,
                "is_correct": is_correct,
                "explanation": q.explanation,
            })

        score = sum(1 for r in results if r["is_correct"])
        total_q = len(quiz.questions)

        submission = QuizSubmission(
            user_id=user_id,
            quiz_id=quiz_id,
            score=score,
            total_questions=total_q,
            time_taken_secs=time_taken_secs,
        )
        db.add(submission)
        await db.flush()

        for ans, r in zip(answers, results):
            db.add(QuizSubmissionAnswer(
                submission_id=submission.id,
                question_id=ans["question_id"],
                selected_option_id=ans.get("selected_option_id"),
                is_correct=r["is_correct"],
            ))

        quiz.participants_count = (quiz.participants_count or 0) + 1
        await db.commit()

        return {
            "submission_id": submission.id,
            "score": score,
            "total_questions": total_q,
            "percentage": round(score / total_q * 100) if total_q else 0,
            "passed": score / total_q >= 0.6 if total_q else False,
            "results": results,
        }

    async def get_my_submission(self, db: AsyncSession, user_id: str, quiz_id: str) -> dict:
        from sqlalchemy.orm import selectinload as sl
        result = await db.execute(
            select(QuizSubmission)
            .where(QuizSubmission.user_id == user_id, QuizSubmission.quiz_id == quiz_id)
            .options(
                sl(QuizSubmission.answers)
                .selectinload(QuizSubmissionAnswer.question)
                .selectinload(QuizQuestion.options)
            )
            .order_by(QuizSubmission.submitted_at.desc())
        )
        submission = result.scalars().first()
        if not submission:
            raise NotFoundError("No submission found for this quiz")

        results = []
        for ans in submission.answers:
            correct_opt = next((o for o in ans.question.options if o.is_correct), None)
            results.append({
                "question_id": ans.question_id,
                "question_text": ans.question.question_text,
                "selected_option_id": ans.selected_option_id,
                "correct_option_id": correct_opt.id if correct_opt else None,
                "is_correct": ans.is_correct,
                "explanation": ans.question.explanation,
            })

        total_q = submission.total_questions
        return {
            "submission_id": submission.id,
            "score": submission.score,
            "total_questions": total_q,
            "percentage": round(submission.score / total_q * 100) if total_q else 0,
            "passed": submission.score / total_q >= 0.6 if total_q else False,
            "results": results,
        }

    async def admin_list_quizzes(
        self, db: AsyncSession, search: str | None, pub_status: str | None, skip: int, limit: int
    ) -> tuple[list[dict], int]:
        query = select(Quiz).options(*_QUIZ_OPTIONS)
        if search:
            query = query.where(Quiz.title.ilike(f"%{search}%"))
        if pub_status == "published":
            query = query.where(Quiz.is_published == True)
        elif pub_status == "draft":
            query = query.where(Quiz.is_published == False)

        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar() or 0

        quizzes_result = await db.execute(query.order_by(Quiz.created_at.desc()).offset(skip).limit(limit))
        quizzes = quizzes_result.scalars().all()
        return [_quiz_to_dict(q) for q in quizzes], total

    async def _create_questions(self, db: AsyncSession, quiz_id: str, questions: list[dict]) -> None:
        for qi, q in enumerate(questions):
            correct_count = sum(1 for o in q["options"] if o["is_correct"])
            if correct_count != 1:
                raise ValidationError("Each question must have exactly 1 correct option")

            qq = QuizQuestion(
                quiz_id=quiz_id,
                question_text=q["question_text"],
                question_image_url=q.get("question_image_url"),
                explanation=q.get("explanation"),
                order_index=q.get("order_index") if q.get("order_index") is not None else qi,
            )
            db.add(qq)
            await db.flush()

            for oi, o in enumerate(q["options"]):
                db.add(QuizOption(
                    question_id=qq.id,
                    option_text=o["option_text"],
                    is_correct=o["is_correct"],
                    order_index=o.get("order_index") if o.get("order_index") is not None else oi,
                ))

    async def admin_create_quiz(self, db: AsyncSession, admin_id: str, data: dict) -> dict:
        if not data.get("questions"):
            raise ValidationError("Quiz must have at least 1 question")

        quiz = Quiz(
            title=data["title"],
            description=data["description"],
            topic=data.get("topic"),
            time_limit=data["time_limit"],
            difficulty=DifficultyEnum(data.get("difficulty", "MEDIUM")),
            has_reward=data.get("has_reward", False),
            reward_description=data.get("reward_description"),
            is_published=data.get("is_published", False),
            created_by_id=admin_id,
        )
        db.add(quiz)
        await db.flush()

        for tag_id in data.get("tag_ids", []):
            db.add(QuizTag(quiz_id=quiz.id, tag_id=tag_id))

        questions = [
            q.model_dump() if hasattr(q, "model_dump") else q
            for q in data["questions"]
        ]
        await self._create_questions(db, quiz.id, questions)
        await db.commit()

        result = await db.execute(
            select(Quiz).where(Quiz.id == quiz.id).options(*_QUIZ_OPTIONS)
        )
        quiz = result.scalar_one()
        return {"id": quiz.id, "title": quiz.title, "is_published": quiz.is_published, "question_count": len(quiz.questions)}

    async def admin_update_quiz(self, db: AsyncSession, quiz_id: str, data: dict) -> dict:
        result = await db.execute(
            select(Quiz).where(Quiz.id == quiz_id).options(*_QUIZ_OPTIONS)
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("Quiz not found")

        if "tag_ids" in data and data["tag_ids"] is not None:
            await db.execute(delete(QuizTag).where(QuizTag.quiz_id == quiz_id))
            for tag_id in data["tag_ids"]:
                db.add(QuizTag(quiz_id=quiz_id, tag_id=tag_id))

        if "questions" in data and data["questions"] is not None:
            for q in quiz.questions:
                await db.delete(q)
            await db.flush()
            questions = [
                q.model_dump() if hasattr(q, "model_dump") else q
                for q in data["questions"]
            ]
            await self._create_questions(db, quiz_id, questions)

        for k, v in data.items():
            if k in ("tag_ids", "questions"):
                continue
            if k == "difficulty" and v:
                quiz.difficulty = DifficultyEnum(v)
            elif v is not None:
                setattr(quiz, k, v)

        await db.commit()

        result = await db.execute(
            select(Quiz).where(Quiz.id == quiz_id).options(*_QUIZ_OPTIONS)
        )
        quiz = result.scalar_one()
        return _quiz_to_dict(quiz)

    async def admin_publish_quiz(self, db: AsyncSession, quiz_id: str, is_published: bool) -> dict:
        result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("Quiz not found")
        quiz.is_published = is_published
        await db.commit()
        return {"id": quiz.id, "is_published": quiz.is_published}

    async def admin_duplicate_quiz(self, db: AsyncSession, quiz_id: str, admin_id: str) -> dict:
        result = await db.execute(
            select(Quiz).where(Quiz.id == quiz_id).options(*_QUIZ_OPTIONS)
        )
        original = result.scalar_one_or_none()
        if not original:
            raise NotFoundError("Quiz not found")

        copy = Quiz(
            title=f"Copy of {original.title}",
            description=original.description,
            topic=original.topic,
            time_limit=original.time_limit,
            difficulty=original.difficulty,
            has_reward=original.has_reward,
            reward_description=original.reward_description,
            is_published=False,
            created_by_id=admin_id,
        )
        db.add(copy)
        await db.flush()

        for qt in original.tags:
            db.add(QuizTag(quiz_id=copy.id, tag_id=qt.tag_id))

        for q in original.questions:
            qq = QuizQuestion(
                quiz_id=copy.id,
                question_text=q.question_text,
                question_image_url=q.question_image_url,
                explanation=q.explanation,
                order_index=q.order_index,
            )
            db.add(qq)
            await db.flush()
            for o in q.options:
                db.add(QuizOption(
                    question_id=qq.id,
                    option_text=o.option_text,
                    is_correct=o.is_correct,
                    order_index=o.order_index,
                ))

        await db.commit()
        return {"id": copy.id, "title": copy.title, "is_published": copy.is_published}

    async def admin_delete_quiz(self, db: AsyncSession, quiz_id: str) -> None:
        result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("Quiz not found")
        await db.delete(quiz)
        await db.commit()
