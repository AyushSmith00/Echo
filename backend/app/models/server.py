from sqlalchemy import Integer, Column, String
from app.db.database import Base
from sqlalchemy.orm import relationship
from app.models.association import server_members

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key = True)
    name = Column(String)

    members = relationship(
        "User",
        secondary=server_members,
        back_populates="servers"
    )

