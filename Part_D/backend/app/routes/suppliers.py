from fastapi import APIRouter, HTTPException, Query
from app.database import db
from app.routes.owner import verify_owner
from bson.objectid import ObjectId

router = APIRouter()

# Obtaining all supplier data.
@router.get("/suppliers")
async def get_suppliers(user_id: str = Query(...)):
    verify_owner(user_id)
    suppliers_cursor = db.users.find({"role": "supplier"})
    suppliers = []
    for s in suppliers_cursor:
        suppliers.append({
            "supplier_id": str(s["_id"]),
            "company_name": s["company_name"]
        })
    return suppliers

# Receiving products from a specific supplier.
@router.get("/suppliers/{supplier_id}/products")
async def get_supplier_products(supplier_id: str, user_id: str = Query(...)):
    verify_owner(user_id)
    supplier = db.users.find_one({"_id": ObjectId(supplier_id), "role": "supplier"})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return supplier["products"]

# Return all orders placed by the grocer for a specific supplier.
@router.get("/supplier-orders/{supplier_id}")
async def get_orders_for_supplier(supplier_id: str):
    try:
        supplier_obj_id = ObjectId(supplier_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")

    orders_cursor = db.orders.find({"supplier_id": supplier_id})
    orders = []
    for order in orders_cursor:
        order["_id"] = str(order["_id"])
        order["created_at"] = order["created_at"].isoformat()
        orders.append(order)
    
    return orders

# The supplier moves an order from "בוצעה" to "בתהליך" status.
@router.put("/orders/{order_id}/start")
async def approve_order_by_supplier(order_id: str, supplier_id: str):
    order = db.orders.find_one({"_id": ObjectId(order_id)})

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["supplier_id"] != supplier_id:
        raise HTTPException(status_code=403, detail="Order does not belong to this supplier")

    if order["status"] != "בוצעה":
        raise HTTPException(status_code=400, detail="Only orders with status 'בוצעה' can be approved")

    db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "בתהליך"}}
    )

    return {"msg": "Order approved and set to 'בתהליך'"}
