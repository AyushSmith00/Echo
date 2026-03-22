from app.models.server import Server
from app.models.server_member import ServerMembers
from fastapi import HTTPException


def create_server(db, name: str, user_id: int):
    new_server = Server(name=name)

    db.add(new_server)
    db.commit()
    db.refresh(new_server)

    membership = ServerMembers(
        server_id=new_server.id,
        user_id=user_id,
        is_admin=True
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    return new_server


def get_user_servers(db, user_id: int):
    servers = (
        db.query(Server)
        .join(ServerMembers, Server.id == ServerMembers.server_id)
        .filter(ServerMembers.user_id == user_id)
        .all()
    )

    return servers


def get_server_by_id(db, server_id: int):
    return db.query(Server).filter(Server.id == server_id).first()


def join_servers(db, user_id: int, server_id: int):
    server = db.query(Server).filter(Server.id == server_id).first()

    if not server:
        raise HTTPException(status_code=404, detail="Server not Found")

    existing_member = db.query(ServerMembers).filter(
        ServerMembers.server_id == server_id,
        ServerMembers.user_id == user_id
    ).first()

    if existing_member:
        raise HTTPException(status_code=400, detail="user already in server")

    membership = ServerMembers(
        server_id=server_id,
        user_id=user_id,
        is_admin=False
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    return membership
