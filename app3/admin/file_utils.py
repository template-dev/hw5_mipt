from pathlib import Path
from fastapi import UploadFile
import shutil
import os

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "products"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

async def save_upload_file(file: UploadFile, product_id: int) -> str:
    filename = f"{product_id}_{file.filename}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return f"uploads/products/{filename}"

async def delete_upload_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)
