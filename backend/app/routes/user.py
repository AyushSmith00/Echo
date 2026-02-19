from fastapi import APIRouter, Depends
from app.crud.user import create_user
from app.db.deps import get_db
from app.schemas.user import UserCreate

router = APIRouter()

@router.post("/register")
def register(user: UserCreate, db=Depends(get_db)):

    registered_user = create_user(db, user.username, user.email, user.password)

    return{
        "id": registered_user.id,
        "username": registered_user.username,
        "email": registered_user.email
    }
