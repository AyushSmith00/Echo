from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.server_member import ServerMembers


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True,nullable=False)
    username = Column(String, unique=True,nullable=False)
    hashed_password = Column(String, nullable=False)

    servers = relationship(
        "ServerMembers",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    messages = relationship("Message", back_populates="user")
