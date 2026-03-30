from sqlalchemy import Column, String, Text
from app.db import Base
import uuid


def cuid():
    return "cuid_" + uuid.uuid4().hex[:10]


class Community(Base):
    __tablename__ = "communities"
    id = Column(String, primary_key=True, default=cuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    photo = Column(String, nullable=True)
    operator_id = Column(String, nullable=False)
