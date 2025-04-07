from fastapi import APIRouter, HTTPException, Query
from app.database import db
from app.models import OrderCreate, OrderStatus
from bson.objectid import ObjectId
from datetime import datetime, timezone
from app.routes.owner import verify_owner
from app.routes.store_inventory import update_inventory_from_order

router = APIRouter()

# Placing an order from the grocer.
@router.post("/orders")
async def create_order(order_data: OrderCreate, user_id: str = Query(...)):
    verify_owner(user_id)
    supplier = db.users.find_one({"_id": ObjectId(order_data.supplier_id), "role": "supplier"})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    min_requirements = {p["product_name"]: p["min_quantity"] for p in supplier["products"]}

    for p in order_data.products:
        if p.quantity > 0 and p.quantity < min_requirements.get(p.product_name, 0):
            raise HTTPException(
                status_code=400,
                detail=f"כמות המוצר '{p.product_name}' קטנה מהמינימום המותר ({min_requirements[p.product_name]})"
            )

    order = {
        "supplier_id": order_data.supplier_id,
        "created_at": datetime.now(timezone.utc),
        "status": OrderStatus.ordered.value,
        "products": [p.dict() for p in order_data.products]
    }

    result = db.orders.insert_one(order)
    return {"order_id": str(result.inserted_id), "msg": "Order created"}

# View existing orders, filtering by order status.
@router.get("/orders")
async def get_orders(user_id: str = Query(...), status: str = None):
    verify_owner(user_id)
    if status == "בתהליך":
        query = {"status": {"$in": ["בתהליך", "בוצעה"]}}
    elif status == "הושלמה":
        query = {}
    elif status:
        query = {"status": status}
    else:
        query = {}

    orders_cursor = db.orders.find(query)
    orders = []
    for order in orders_cursor:
        order["_id"] = str(order["_id"])
        order["created_at"] = order["created_at"].isoformat()
        orders.append(order)
    return orders

# Moving the order status from "בתהליך" to "הושלמה" by the grocery store owner.
@router.put("/orders/{order_id}/complete")
async def complete_order(order_id: str, user_id: str = Query(...)):
    verify_owner(user_id)
    order = db.orders.find_one({"_id": ObjectId(order_id)})

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] != OrderStatus.in_process.value:
        raise HTTPException(status_code=400, detail="Only orders 'בתהליך' can be completed")

    db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": OrderStatus.completed.value}}
    )

    await update_inventory_from_order(order_id)

    return {"msg": "Order marked as 'הושלמה'"}
