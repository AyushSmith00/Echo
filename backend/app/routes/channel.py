from fastapi import APIRouter, Depends
from app.crud.channel import create_channel, get_server_channel
from app.core.dependencies import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.core.permission import validate_server_admin, validate_server_members
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/channels")
def create_channel_route(
    name: str, 
    server_id: int, 
    db=Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):

    validate_server_admin(db, server_id, current_user.id)
    
    channel = create_channel(db, name, server_id)

    return{
        "id": channel.id,
        "name": channel.name,
        "server_id": channel.server_id
    }

@router.get("/servers/{server_id}/channels")
def get_channel(
    server_id:int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):

    validate_server_members(db, server_id, current_user.id)

    channels = get_server_channel(db, server_id)

    return channels