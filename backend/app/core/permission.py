from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.server_member import ServerMembers
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
        ServerMembers.select().where(
            ServerMembers.c.user_id == user_id,
            ServerMembers.c.server_id == channel.server_id
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this server")
    
    return channel

def validate_server_admin(db, server_id: int, user_id: int):

    membership = db.execute(
        ServerMembers.select().where(
            ServerMembers.c.user_id == user_id,
            ServerMembers.c.server_id == server_id
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member")
    
    if not membership._mapping["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin required")
    
    return True

def validate_server_member(db, server_id, user_id):

    membership = db.execute(
        ServerMembers.select().where(
            ServerMembers.c.user_id == user_id,
            ServerMembers.c.server_id == server_id
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="not a member of this server")
    
    return True