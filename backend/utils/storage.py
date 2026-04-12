import cloudinary
import cloudinary.uploader
from supabase import create_client, Client
from config.settings import Configs

_supabase: Client | None = None


def _init_cloudinary() -> None:
    cfg = Configs.storage()
    cloudinary.config(
        cloud_name=cfg.cloudinary_cloud_name,
        api_key=cfg.cloudinary_api_key,
        api_secret=cfg.cloudinary_api_secret,
    )


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        cfg = Configs.storage()
        _supabase = create_client(cfg.supabase_url, cfg.supabase_service_key)
    return _supabase


def upload_to_cloudinary(
    data: bytes,
    folder: str,
    width: int | None = None,
    height: int | None = None,
    crop: str = "fill",
) -> tuple[str, str]:
    """Returns (url, public_id)."""
    _init_cloudinary()
    options: dict = {"folder": f"chemischill/{folder}", "resource_type": "image"}
    if width or height:
        options["transformation"] = [{"width": width, "height": height, "crop": crop}]
    result = cloudinary.uploader.upload(data, **options)
    return result["secure_url"], result["public_id"]


def delete_from_cloudinary(public_id: str) -> None:
    _init_cloudinary()
    cloudinary.uploader.destroy(public_id)


def upload_to_supabase(data: bytes, file_path: str, content_type: str) -> tuple[str, str]:
    """Returns (public_url, key)."""
    sb = get_supabase()
    bucket = Configs.storage().supabase_storage_bucket
    sb.storage.from_(bucket).upload(file_path, data, {"content-type": content_type})
    url = sb.storage.from_(bucket).get_public_url(file_path)
    return url, file_path


def delete_from_supabase(file_path: str) -> None:
    sb = get_supabase()
    sb.storage.from_(Configs.storage().supabase_storage_bucket).remove([file_path])


def create_supabase_signed_url(file_path: str, expires_in: int = 300) -> str:
    sb = get_supabase()
    result = sb.storage.from_(Configs.storage().supabase_storage_bucket).create_signed_url(
        file_path, expires_in
    )
    return result["signedURL"]
