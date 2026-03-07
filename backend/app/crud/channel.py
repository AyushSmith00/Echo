from app.models.channel import Channel
from sqlalchemy.orm import Session

def create_channel(db, name:str, server_id: int):

    channel = Channel(name=name, server_id=server_id)

    db.add(channel)
    db.commit()
    db.refresh(channel)
    return channel

def get_server_channel(db: Session, server_id: int):

    return(
        db.execute(Channel).filter(Channel.server_id == server_id).all()
    )