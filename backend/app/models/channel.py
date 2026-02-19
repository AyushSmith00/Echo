from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    server_id = Column(Integer, ForeignKey("servers.id"))

    server = relationship("Server", backref="channels")
