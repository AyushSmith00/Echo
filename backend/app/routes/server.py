from fastapi import APIRouter, Depends
from app.crud.server import create_server
from app.db.deps import get_db
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/servers")
def create_server_route(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = create_server(db, name, current_user.id)

    return{
        "id": server.id,
        "name": server.name,
        "created_by": current_user.username
    }