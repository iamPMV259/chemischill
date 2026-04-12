from pydantic import BaseModel


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


def paginate(total: int, page: int, limit: int) -> PaginationMeta:
    return PaginationMeta(
        page=page,
        limit=limit,
        total=total,
        total_pages=max(1, -(-total // limit)),
    )


def pagination_params(page: int = 1, limit: int = 20) -> dict:
    page = max(1, page)
    limit = min(100, max(1, limit))
    skip = (page - 1) * limit
    return {"page": page, "limit": limit, "skip": skip}
