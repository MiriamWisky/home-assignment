from fastapi import FastAPI, Query, APIRouter, HTTPException
from app.database import db
# from app.models import Supplier, Order, OrderStatus, OrderedProduct, OrderCreate, OrderStatus
from bson.objectid import ObjectId
# from datetime import datetime, timezone
from app.routes import auth, store_inventory, orders, suppliers, owner
# from datetime import datetime, timezone
# from app.routes.store_inventory import update_inventory_from_order
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(store_inventory.router)
app.include_router(orders.router)
app.include_router(suppliers.router)
router = APIRouter()


@app.get("/")
async def root():
    return {"collections": db.list_collection_names()}

app.include_router(router)

