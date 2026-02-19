from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.database import Base

server_members = Table(
    "server_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("server_id", Integer, ForeignKey("servers.id"), primary_key=True)
)