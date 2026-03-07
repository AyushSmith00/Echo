from app.models.server import Server
from app.models.association import server_members
from app.models.user import User

def create_server(db, name: str, user_id: int):

    new_server = Server(name=name)

    db.add(new_server)
    db.commit()
    db.refresh(new_server)

    db.execute(
        server_members.insert().values(
            user_id = user_id,
            server_id = new_server.id,
            is_admin = True
        )
    )

    db.commit()

    return new_server

def get_user_servers(db, user_id: int):

    user = db.query().filter(User.id == user_id).first()

    return user