from fastapi import APIRouter, Depends
from app.crud.server import create_server
from app.db.deps import get_db

router = APIRouter()

@router.post("/servers")
def create_server_route(name: str, db=Depends(get_db)):
    user_id = 1

    server = create_server(db, name, user_id)

    return{
        "id": server.id,
        "name": server.name
    }