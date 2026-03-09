from fastapi import APIRouter, Depends
from app.crud.server import create_server, get_user_servers,  get_server_by_id, join_servers
from app.db.deps import get_db
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.permission import validate_server_member


router = APIRouter(tags=["Servers"])

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

@router.get("/servers")
def get_servers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    servers = get_user_servers(db, current_user.id)

    return servers

@router.get("/servers/{server_id}")
def get_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    validate_server_member(db ,server_id, current_user.id)

    server =  get_server_by_id(db, server_id)

    return server

@router.post("/servers/{server_id}/join")
def join_server_route(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = join_servers(db ,current_user.id, server_id)

    return {"message": "Joined server successfully",
            "server_id": membership.server_id,
            "user_id": membership.user_id
            }