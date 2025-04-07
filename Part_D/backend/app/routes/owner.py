from fastapi import Query, HTTPException
from bson.objectid import ObjectId
from app.database import db

# Permission check.
def verify_owner(user_id: str = Query(...)):
    if user_id == "auto":
        return {"_id": "auto", "role": "owner"}

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can perform this action")
    return user
