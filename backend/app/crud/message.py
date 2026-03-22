from app.models.message import Message
from sqlalchemy.orm import Session


def create_message(db: Session, content: str, user_id: int, channel_id: int):
    message = Message(
        content=content,
        user_id=user_id,
        channel_id=channel_id
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def get_channel_messages(db: Session, channel_id: int, limit=50, offset=0):
    return (
        db.query(Message)
        .filter(Message.channel_id == channel_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_message(db: Session, message_id: int):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        return None

    db.delete(message)
    db.commit()

    return message
