import json
import logging
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, get_current_user, get_optional_user, require_admin
from api.models import RejectRequest
from services.community import CommunityService
from utils.pagination import paginate, pagination_params
from utils.storage import upload_to_cloudinary
from database.models import User
from hooks.error import BaseAppException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["community"])


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/community/questions")
async def list_questions(
    search: str | None = Query(default=None),
    tag_ids: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, le=100),
    db: AsyncSession = Depends(get_db),
):
    params = pagination_params(page, limit)
    tid_list = tag_ids.split(",") if tag_ids else None
    questions, total = await CommunityService().list_questions(db, search, tid_list, params["skip"], params["limit"])
    return {"data": questions, "pagination": paginate(total, params["page"], params["limit"]).model_dump()}


@router.get("/community/questions/{question_id}")
async def get_question(question_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await CommunityService().get_question(db, question_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/community/questions/{question_id}/answers")
async def list_answers(
    question_id: str,
    sort_by: str = Query(default="upvotes"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, le=100),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    params = pagination_params(page, limit)
    user_id = current_user.id if current_user else None
    try:
        answers, total = await CommunityService().list_answers(db, question_id, user_id, sort_by, params["skip"], params["limit"])
    except BaseAppException as e:
        raise _map_exc(e)
    return {"data": answers, "pagination": paginate(total, params["page"], params["limit"]).model_dump()}


@router.post("/community/questions", status_code=201)
async def create_question(
    title: str = Form(...),
    content: str = Form(...),
    tag_ids: str = Form(...),
    images: list[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid_list = json.loads(tag_ids)
    if not tid_list:
        raise HTTPException(status_code=400, detail="At least 1 tag is required")

    valid_images = [img for img in images if img.filename]
    if len(valid_images) > 3:
        raise HTTPException(status_code=400, detail="Max 3 images allowed")

    try:
        return await CommunityService().create_question(db, current_user.id, title, content, tid_list, valid_images)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/community/questions/{question_id}/answers", status_code=201)
async def create_answer(
    question_id: str,
    content: str = Form(...),
    reply_to_answer_id: str | None = Form(default=None),
    images: list[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    valid_images = [img for img in images if img.filename]
    if len(valid_images) > 3:
        raise HTTPException(status_code=400, detail="Max 3 images allowed")
    try:
        return await CommunityService().create_answer(db, current_user.id, question_id, content, valid_images, reply_to_answer_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/community/answers/{answer_id}/upvote")
async def upvote_answer(
    answer_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await CommunityService().upvote_answer(db, current_user.id, answer_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.delete("/community/answers/{answer_id}/upvote")
async def remove_upvote(
    answer_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await CommunityService().remove_upvote(db, current_user.id, answer_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/admin/community/questions")
async def admin_list_questions(
    status: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = pagination_params(page, limit)
    questions, total, counts = await CommunityService().admin_list_questions(db, status, params["skip"], params["limit"])
    return {
        "data": questions,
        "counts": counts,
        "pagination": paginate(total, params["page"], params["limit"]).model_dump(),
    }


@router.patch("/admin/community/questions/{question_id}/approve")
async def approve_question(
    question_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await CommunityService().admin_review_question(db, question_id, admin.id, "APPROVED")
    except BaseAppException as e:
        raise _map_exc(e)


@router.patch("/admin/community/questions/{question_id}/reject")
async def reject_question(
    question_id: str,
    body: RejectRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await CommunityService().admin_review_question(db, question_id, admin.id, "REJECTED", body.admin_note)
    except BaseAppException as e:
        raise _map_exc(e)


@router.patch("/admin/community/questions/{question_id}/request-revision")
async def request_revision(
    question_id: str,
    body: RejectRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await CommunityService().admin_review_question(db, question_id, admin.id, "REVISION_REQUESTED", body.admin_note)
    except BaseAppException as e:
        raise _map_exc(e)


@router.delete("/admin/community/questions/{question_id}")
async def admin_delete_question(
    question_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        await CommunityService().admin_delete_question(db, question_id)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"message": "Question deleted"}


@router.get("/admin/stats")
async def admin_stats(db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    return await CommunityService().get_admin_stats(db)


@router.post("/upload/image")
async def upload_image(
    image: UploadFile = File(...),
    type: str = Form(default="question"),
    current_user: User = Depends(get_current_user),
):
    allowed_mimes = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if image.content_type not in allowed_mimes:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP, GIF allowed")

    data = await image.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    folder_map = {"avatar": "avatars", "answer": "answer-images", "question": "question-images"}
    folder = folder_map.get(type, "question-images")
    url, key = upload_to_cloudinary(data, folder)
    return {"image_url": url, "image_key": key}
