from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.schemas.message import MessageCreate, MessageOut
from app.crud.message import create_message, get_channel_messages
from app.core.dependincies import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageOut)
def send_message(
    msg: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return create_message(
        db,
        msg.content,
        current_user.id,
        msg.channel_id
    )


@router.get("/{channel_id}", response_model=list[MessageOut])
def read_messages(channel_id: int, db: Session = Depends(get_db)):
    return get_channel_messages(db, channel_id)
