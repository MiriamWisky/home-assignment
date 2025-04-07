from fastapi import APIRouter, HTTPException
from app.models import SupplierRegister, UserLogin
from app.database import db
from passlib.context import CryptContext
from bson.objectid import ObjectId

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Registration of a new supplier.
@router.post("/register-supplier")
async def register_supplier(supplier: SupplierRegister):
    existing_username = db.users.find_one({"username": supplier.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    existing_phone = db.users.find_one({"phone_number": supplier.phone_number})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    hashed_pw = pwd_context.hash(supplier.password)

    user_data = {
        "username": supplier.username,
        "hashed_password": hashed_pw,
        "role": "supplier",
        "company_name": supplier.company_name,
        "phone_number": supplier.phone_number,
        "representative_name": supplier.representative_name,
        "products": [product.dict() for product in supplier.products]
    }

    result = db.users.insert_one(user_data)
    return {
        "user_id": str(result.inserted_id),
        "msg": "Supplier registered successfully"
    }


#  Login for an existing user.
@router.post("/login")
async def login_user(login_data: UserLogin):
    user = db.users.find_one({"username": login_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    if not pwd_context.verify(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    return {
        "user_id": str(user["_id"]),
        "role": user["role"],
        "company_name": user.get("company_name", None)
    }
