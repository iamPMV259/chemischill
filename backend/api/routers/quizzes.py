import logging
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, get_current_user, require_admin
from api.models import CreateQuizRequest, UpdateQuizRequest, PublishQuizRequest, SubmitQuizRequest
from services.quizzes import QuizzesService
from utils.pagination import paginate, pagination_params
from database.models import User
from hooks.error import BaseAppException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["quizzes"])


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/quizzes")
async def list_quizzes(
    search: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    tag_ids: str | None = Query(default=None),
    has_reward: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, le=100),
    db: AsyncSession = Depends(get_db),
):
    params = pagination_params(page, limit)
    tid_list = tag_ids.split(",") if tag_ids else None
    quizzes, total = await QuizzesService().list_quizzes(db, search, difficulty, tid_list, has_reward, params["skip"], params["limit"])
    return {"data": quizzes, "pagination": paginate(total, params["page"], params["limit"]).model_dump()}


@router.get("/quizzes/featured")
async def featured_quizzes(db: AsyncSession = Depends(get_db)):
    return {"data": await QuizzesService().get_featured_quizzes(db)}


@router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str, _user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await QuizzesService().get_quiz_for_taking(db, quiz_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/quizzes/{quiz_id}/submit", status_code=201)
async def submit_quiz(
    quiz_id: str,
    body: SubmitQuizRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    answers = [{"question_id": a.question_id, "selected_option_id": a.selected_option_id} for a in body.answers]
    try:
        return await QuizzesService().submit_quiz(db, current_user.id, quiz_id, answers, body.time_taken_secs)
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/quizzes/{quiz_id}/submissions/me")
async def get_my_submission(
    quiz_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await QuizzesService().get_my_submission(db, current_user.id, quiz_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/admin/quizzes")
async def admin_list_quizzes(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = pagination_params(page, limit)
    quizzes, total = await QuizzesService().admin_list_quizzes(db, search, status, params["skip"], params["limit"])
    return {"data": quizzes, "pagination": paginate(total, params["page"], params["limit"]).model_dump()}


@router.post("/admin/quizzes", status_code=201)
async def admin_create_quiz(
    body: CreateQuizRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await QuizzesService().admin_create_quiz(db, admin.id, body.model_dump())
    except BaseAppException as e:
        raise _map_exc(e)


@router.patch("/admin/quizzes/{quiz_id}")
async def admin_update_quiz(
    quiz_id: str,
    body: UpdateQuizRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await QuizzesService().admin_update_quiz(db, quiz_id, body.model_dump(exclude_none=True))
    except BaseAppException as e:
        raise _map_exc(e)


@router.patch("/admin/quizzes/{quiz_id}/publish")
async def admin_publish_quiz(
    quiz_id: str,
    body: PublishQuizRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await QuizzesService().admin_publish_quiz(db, quiz_id, body.is_published)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/admin/quizzes/{quiz_id}/duplicate", status_code=201)
async def admin_duplicate_quiz(
    quiz_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await QuizzesService().admin_duplicate_quiz(db, quiz_id, admin.id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.delete("/admin/quizzes/{quiz_id}")
async def admin_delete_quiz(
    quiz_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        await QuizzesService().admin_delete_quiz(db, quiz_id)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"message": "Quiz deleted"}
