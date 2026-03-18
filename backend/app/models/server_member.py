from sqlalchemy import Column, Integer, Boolean, ForeignKey
from app.db.database import Base
from sqlalchemy.orm import relationship

class ServerMembers(Base):
    __tablename__ = "server_members"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=False)

    is_admin = Column(Boolean, default=False)

    user = relationship("User", back_populates="servers")
    server = relationship("Server", back_populates="members")