from app.models.channel import Channel

def create_channel(db, name:str, server_id: int):

    channel = Channel(name=name, server_id=server_id)

    db.add(channel)
    db.commit()
    db.refresh(channel)
    return channel