from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.association import server_members
from app.models.channel import Channel

def validate_channel_member(
        db: Session,
        channel_id: int,
        user_id: int
):
    channel = db.query(Channel).filter(Channel.id == channel_id).first()

    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    membership = db.execute(
        server_members.select().where(
            server_members.c.user_id == user_id,
            server_members.c.server_id == channel.server_id
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this server")
    
    return channel