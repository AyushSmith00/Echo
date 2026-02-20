from app.models.message import Message
from sqlalchemy.orm import Session

def create_message(db: Session ,content:str , user_id:int, channel_id:int):

    message = Message(content=content, user_id=user_id,channel_id=channel_id)

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

def get_channel_message(db:Session, channel_id:int):
    return db.query(Message).filter(Message.channel_id==channel_id).all()