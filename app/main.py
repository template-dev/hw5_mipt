from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.orders.routers import router as order_router
from app.database.db import engine, Base, AsyncSessionLocal
from app2.products.models import Product
from sqlalchemy.future import select
from pathlib import Path
import os
from sqlalchemy.exc import NoResultFound
from app2.products.routers import get_product_by_id

app = FastAPI()

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "templates"

app.mount(
    "/static",
    StaticFiles(directory=TEMPLATES_DIR),
    name="static"
)

templates = Jinja2Templates(directory=TEMPLATES_DIR)

app.include_router(order_router)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup_event():
    await create_tables()
    print("Tables have been created successfully")