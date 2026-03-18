from sqlalchemy import Integer, Column, String
from app.db.database import Base
from sqlalchemy.orm import relationship
from app.models.server_member import ServerMembers

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key = True)
    name = Column(String)

    members = relationship(
        "ServerMembers",
        back_populates="server"
    )