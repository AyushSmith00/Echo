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
        db.query(Channel).filter(Channel.server_id == server_id).all()
    )

def delete_channel(db: Session, channel_id: int):
    channel = db.query(Channel).filter(Channel.id == channel_id).first()

    if not channel:
        return None
    
    db.delete(channel)
    db.commit()

    return channel