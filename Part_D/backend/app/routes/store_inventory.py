from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.models import  MinQuantityUpdate
from bson.objectid import ObjectId
from datetime import datetime, timezone
from typing import Dict

router = APIRouter()

# Receiving inventory of goods in the store.
@router.get("/inventory")
async def get_inventory():
    inventory_cursor = db.store_inventory.find()
    inventory = []
    for item in inventory_cursor:
        inventory.append({
            "product_name": item["product_name"],
            "current_quantity": item["current_quantity"],
            "min_quantity": item.get("min_quantity", 0)
        })
    return inventory

# Updating the minimum quantity required for a product in the store.
@router.put("/inventory/{product_name}")
async def update_min_quantity(product_name: str, data: MinQuantityUpdate):
    result = db.store_inventory.update_one(
        {"product_name": product_name},
        {"$set": {"min_quantity": data.min_quantity}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
     # check if need to order more
    product = db.store_inventory.find_one({"product_name": product_name})
    if product and product["current_quantity"] < data.min_quantity:

        from app.routes.store_inventory import handle_register_purchase
        await handle_register_purchase({product_name: 0})

    return {"msg": "Minimum quantity updated"}

# The path to which the list of products purchased from the checkout will reach, the inventory will be updated and an order will be placed in the event of a gap between the inventory and the minimum required quantity.
@router.post("/register/purchase")
async def handle_register_purchase(purchase: Dict[str, int]):
    updated_items = []
    for product_name, quantity_sold in purchase.items():
        product = db.store_inventory.find_one({"product_name": product_name})

        if not product:
            db.store_inventory.insert_one({
                "product_name": product_name,
                "current_quantity": 0,
                "min_quantity": 0
            })
            product = db.store_inventory.find_one({"product_name": product_name})

        old_quantity = product.get("current_quantity", 0)
        new_quantity = max(0, old_quantity - quantity_sold)
        
        db.store_inventory.update_one(
            {"_id": product["_id"]},
            {"$set": {"current_quantity": new_quantity}}
        )

        updated_items.append((product_name, new_quantity))

        if new_quantity < product.get("min_quantity", 0):
            suppliers = db.users.find({
                "role": "supplier",
                "products.product_name": product_name
            })

            best_supplier = None
            best_price = float('inf')
            min_order_quantity = None

            for supplier in suppliers:
                for p in supplier["products"]:
                    if p["product_name"] == product_name and p["price"] < best_price:
                        best_price = p["price"]
                        best_supplier = supplier
                        min_order_quantity = p.get("min_quantity", 1)

            if best_supplier:
                quantity_to_order = product.get("min_quantity", 0) - new_quantity
                if quantity_to_order < min_order_quantity:
                    quantity_to_order = min_order_quantity

                from app.models import OrderCreate, OrderedProduct
                from app.routes.orders import create_order

                auto_order = OrderCreate(
                    supplier_id=str(best_supplier["_id"]),
                    products=[
                        OrderedProduct(
                            product_name=product_name,
                            quantity=quantity_to_order,
                            unit_price=best_price,
                            total_price=best_price * quantity_to_order
                        )
                    ]
                )
                await create_order(auto_order, user_id="auto")
            else:
                print(f"אין ספק זמין עבור {product_name}")

    return {"msg": "Inventory updated", "updated_items": updated_items}

# Updating the store inventory after the store owner places an order and it is "הושלמה"
@router.put("/inventory/from-order/{order_id}")
async def update_inventory_from_order(order_id: str):
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    for product in order.get("products", []):
        product_name = product["product_name"]
        quantity = product["quantity"]

        db.store_inventory.update_one(
            {"product_name": product_name},
            {
                "$inc": {"current_quantity": quantity},
                "$setOnInsert": {"min_quantity": 0}
            },
            upsert=True
        )

    return {"msg": "Inventory updated from completed order"}
