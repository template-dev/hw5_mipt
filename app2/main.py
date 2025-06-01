from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app2.products.routers import router as products_router
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

app.include_router(products_router)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup_event():
    await create_tables()
    print("Tables have been created successfully")

@app.get("/", response_class=HTMLResponse)
async def home_page(request: Request, skip: int = 0, limit: int = 100):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Product).offset(skip).limit(limit))
        products = result.scalars().all()        
        return templates.TemplateResponse(
            "client/index.html",
            {"request": request, "products": products}
        )

@app.get("/products/{product_id}", response_class=HTMLResponse)
async def product(request: Request, product_id: int):
    async with AsyncSessionLocal() as session:
        try:
            product = await get_product_by_id(product_id, session)
            return templates.TemplateResponse(
                "client/product.html", 
                {"request": request, "product": product}
            )
        except NoResultFound:
            return templates.TemplateResponse(
                "client/404.html", 
                {"request": request}
            )

@app.get("/payment_delivery", response_class=HTMLResponse)
async def payment_delivery(request: Request):
    return templates.TemplateResponse("client/payment_delivery.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
async def about_us(request: Request):
    return templates.TemplateResponse("client/about.html", {"request": request})

@app.get("/contacts", response_class=HTMLResponse)
async def contacts(request: Request):
    return templates.TemplateResponse("client/contacts.html", {"request": request})

@app.get("/favorites", response_class=HTMLResponse)
async def favorites(request: Request):
    return templates.TemplateResponse("client/favorites.html", {"request": request})

@app.get("/basket", response_class=HTMLResponse)
async def basket(request: Request):
    return templates.TemplateResponse("client/basket.html", {"request": request})

@app.get("/order", response_class=HTMLResponse)
async def order(request: Request):
    return templates.TemplateResponse("client/order.html", {"request": request})

@app.get("/404", response_class=HTMLResponse)
async def page_on_found(request: Request):
    return templates.TemplateResponse("client/404.html", {"request": request})
