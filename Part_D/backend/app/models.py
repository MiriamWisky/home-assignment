# 
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime, timezone
from typing import Dict


# Product
class Product(BaseModel):
    product_name: str
    price: float
    min_quantity: int

# Supplier
class Supplier(BaseModel):
    company_name: str
    phone_number: str
    representative_name: str
    products: List[Product]

# Order - status
class OrderStatus(str, Enum):
    ordered = "בוצעה"
    in_process = "בתהליך"
    completed = "הושלמה"

# Product in order
class OrderedProduct(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    total_price: float


# 
class OrderCreate(BaseModel):
    supplier_id: str
    products: List[OrderedProduct]


# Register - supplier
class SupplierRegister(BaseModel):
    username: str
    password: str
    company_name: str
    phone_number: str
    representative_name: str
    products: List[Product]

# Login
class UserLogin(BaseModel):
    username: str
    password: str

# Minimum for a product
class MinQuantityUpdate(BaseModel):
    min_quantity: int = Field(..., ge=0)
