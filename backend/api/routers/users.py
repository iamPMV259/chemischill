import logging
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, get_current_user, require_admin
from api.models import UpdateMeRequest, UpdateUserStatusRequest
from services.users import UsersService
from utils.pagination import paginate, pagination_params
from database.models import User
from hooks.error import BaseAppException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["users"])


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


def _build_user_out(data: dict) -> dict:
    u = data["user"]
    return {
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "full_name": u.full_name,
        "avatar_url": u.avatar_url,
        "phone": u.phone,
        "birth_year": u.birth_year,
        "school": u.school,
        "role": u.role.value,
        "created_at": u.created_at,
        "stats": data["stats"],
    }


@router.get("/users/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return _build_user_out(await UsersService().get_me(db, current_user.id))
    except BaseAppException as e:
        raise _map_exc(e)


@router.patch("/users/me")
async def update_me(
    body: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        return _build_user_out(await UsersService().update_me(db, current_user.id, data))
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/users/me/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if avatar.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP allowed")
    data = await avatar.read()
    if len(data) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 2MB")
    try:
        url = await UsersService().update_avatar(db, current_user.id, data)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"avatar_url": url}


@router.get("/users/{user_id}")
async def get_public_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    try:
        data = await UsersService().get_public_profile(db, user_id)
    except BaseAppException as e:
        raise _map_exc(e)
    u = data["user"]
    return {
        "id": u.id,
        "username": u.username,
        "full_name": u.full_name,
        "avatar_url": u.avatar_url,
        "school": u.school,
        "created_at": u.created_at,
        "stats": data["stats"],
    }


@router.get("/leaderboard")
async def get_leaderboard(
    period: str = Query(default="all-time"),
    limit: int = Query(default=50, le=100),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await UsersService().get_leaderboard(db, period, limit)
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/admin/users")
async def admin_list_users(
    search: str | None = Query(default=None),
    user_status: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = pagination_params(page, limit)
    try:
        rows, total = await UsersService().admin_list_users(db, search, user_status, params["skip"], params["limit"])
    except BaseAppException as e:
        raise _map_exc(e)
    data = []
    for r in rows:
        u = r["user"]
        data.append({
            "id": u.id, "username": u.username, "full_name": u.full_name,
            "email": u.email, "phone": u.phone, "avatar_url": u.avatar_url,
            "role": u.role.value, "status": u.status.value, "created_at": u.created_at,
            "stats": r["stats"],
        })
    return {"data": data, "pagination": paginate(total, params["page"], params["limit"]).model_dump()}


@router.patch("/admin/users/{user_id}/status")
async def admin_update_status(
    user_id: str,
    body: UpdateUserStatusRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    try:
        user = await UsersService().admin_update_user_status(db, user_id, body.status)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"id": user.id, "status": user.status.value}
