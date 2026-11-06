import os
import uuid
from typing import Tuple
from fastapi import HTTPException, status

MAGIC_SIGNATURES = {
    "pdf": [b"%PDF"],
    "png": [b"\x89PNG\r\n\x1a\n"],
    "jpg": [b"\xff\xd8\xff"],
    "jpeg": [b"\xff\xd8\xff"],
    "docx": [b"PK\x03\x04"],
    "pptx": [b"PK\x03\x04"],
}

SIZE_LIMITS = {
    "pdf": 20 * 1024 * 1024,
    "docx": 20 * 1024 * 1024,
    "pptx": 20 * 1024 * 1024,
    "png": 10 * 1024 * 1024,
    "jpg": 10 * 1024 * 1024,
    "jpeg": 10 * 1024 * 1024,
}

MALICIOUS_PREFIXES = [
    b"<!DOCTYPE html",
    b"<html",
    b"<?php",
    b"<script",
    b"MZ",       # Windows PE executable
    b"\x7fELF",   # Linux executable
]

def validate_and_save_upload(
    header_bytes: bytes,
    file_bytes: bytes,
    original_filename: str,
    target_dir: str
) -> Tuple[str, str, int]:
    """
    Validates file extension, magic bytes header, file size, and malware signatures.
    Saves the file outside the web root with a cryptographically random UUID filename.
    Returns: (safe_file_path, extension, file_size)
    """
    if not original_filename or "." not in original_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must possess a valid filename with extension."
        )

    ext = original_filename.rsplit(".", 1)[-1].lower()
    if ext not in MAGIC_SIGNATURES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Permitted: PDF, DOCX, PPTX, PNG, JPG."
        )

    # Check for executable or script headers
    for mal in MALICIOUS_PREFIXES:
        if header_bytes.startswith(mal):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security rejection: File contents match forbidden executable or script formats."
            )

    # Verify Magic Bytes
    valid_magic = any(header_bytes.startswith(sig) for sig in MAGIC_SIGNATURES[ext])
    if not valid_magic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME verification failure: File headers do not match expected signature for '.{ext}'."
        )

    # Enforce size limit per type
    max_size = SIZE_LIMITS.get(ext, 10 * 1024 * 1024)
    file_size = len(file_bytes)
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size for .{ext} ({max_size // (1024 * 1024)}MB)."
        )

    os.makedirs(target_dir, exist_ok=True)
    random_filename = f"{uuid.uuid4().hex}.{ext}"
    safe_path = os.path.join(target_dir, random_filename)

    with open(safe_path, "wb") as f:
        f.write(file_bytes)

    return safe_path, ext, file_size

