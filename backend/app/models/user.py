from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.association import server_members


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True,nullable=False)
    username = Column(String, unique=True,nullable=False)
    hashed_password = Column(String, nullable=False)

    servers = relationship(
        "Server",
        secondary=server_members,
        back_populates="members"
    )
