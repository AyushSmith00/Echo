from fastapi import APIRouter, Depends
from app.crud.channel import create_channel
from app.db.deps import get_db

router = APIRouter()

@router.post("/channels")
def create_channel_route(name: str, server_id: int, db=Depends(get_db)):
    channel = create_channel(db, name, server_id)

    return{
        "id": channel.id,
        "name": channel.name,
        "server_id": channel.server_id
    }