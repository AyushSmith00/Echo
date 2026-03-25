from sqlalchemy import Integer, Column, String
from app.db.database import Base
from sqlalchemy.orm import relationship

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    invite_code = Column(String, unique=True, index=True)

    members = relationship(
        "ServerMembers",
        back_populates="server",
        cascade="all, delete-orphan"
    )

    channels = relationship(
        "Channel",
        back_populates="server",
        cascade="all, delete-orphan"
    )
