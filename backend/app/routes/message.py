from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.schemas.message import MessageCreate, MessageOut
from app.crud.message import create_message, get_channel_messages, delete_message
from app.core.dependencies import get_current_user
from app.core.permission import validate_channel_member
from app.models.message import Message

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageOut)
def send_message(
    msg: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    validate_channel_member(
        db,
        msg.channel_id,
        current_user.id
    )

    return create_message(
        db,
        msg.content,
        current_user.id,
        msg.channel_id
    )


@router.get("/{channel_id}", response_model=list[MessageOut])
def read_messages(
    channel_id: int,
    limit: int=50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
    
    ):

    validate_channel_member(
        db,
        channel_id,
        current_user.id
    )
    return get_channel_messages(db, channel_id, limit,offset)

@router.delete("/{message_id}")
def delete_message_route(
    message_id: int,
    db: Session= Depends(get_db),
    current_user =  Depends(get_current_user)
):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    validate_channel_member(db, message.channel_id, current_user.id)

    if message.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    
    delete_message(db, message_id)

    return {"message": "Messaged deleted"}
