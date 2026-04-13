from urllib.parse import quote

import boto3
import cloudinary
import cloudinary.uploader
from config.settings import Configs
from hooks.error import ValidationError

_r2_client = None


def _init_cloudinary() -> None:
    cfg = Configs.storage()
    cloudinary.config(
        cloud_name=cfg.cloudinary_cloud_name,
        api_key=cfg.cloudinary_api_key,
        api_secret=cfg.cloudinary_api_secret,
    )


def get_r2_client():
    global _r2_client
    if _r2_client is None:
        cfg = Configs.storage()
        if not all([cfg.r2_endpoint_url, cfg.r2_access_key_id, cfg.r2_secret_access_key]):
            raise ValidationError("Cloudflare R2 storage is not configured")
        _r2_client = boto3.client(
            "s3",
            endpoint_url=cfg.r2_endpoint_url,
            aws_access_key_id=cfg.r2_access_key_id,
            aws_secret_access_key=cfg.r2_secret_access_key,
            region_name="auto",
        )
    return _r2_client


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


def upload_to_r2(data: bytes, file_path: str, content_type: str) -> tuple[str, str]:
    client = get_r2_client()
    cfg = Configs.storage()
    if not cfg.r2_bucket:
        raise ValidationError("Cloudflare R2 bucket is not configured")

    client.put_object(
        Bucket=cfg.r2_bucket,
        Key=file_path,
        Body=data,
        ContentType=content_type,
    )
    return create_r2_public_url(file_path), file_path


def delete_from_r2(file_path: str) -> None:
    client = get_r2_client()
    cfg = Configs.storage()
    if not cfg.r2_bucket:
        raise ValidationError("Cloudflare R2 bucket is not configured")
    client.delete_object(Bucket=cfg.r2_bucket, Key=file_path)


def create_r2_signed_url(file_path: str, expires_in: int = 300) -> str:
    client = get_r2_client()
    cfg = Configs.storage()
    if not cfg.r2_bucket:
        raise ValidationError("Cloudflare R2 bucket is not configured")
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": cfg.r2_bucket, "Key": file_path},
        ExpiresIn=expires_in,
    )


def create_r2_public_url(file_path: str) -> str:
    cfg = Configs.storage()
    if cfg.r2_public_base_url:
        return f"{cfg.r2_public_base_url.rstrip('/')}/{quote(file_path)}"
    raise ValidationError("Cloudflare R2 public base URL is not configured")
