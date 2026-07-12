from sqlalchemy import Column, Integer, String
from .database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    instagram_handle = Column(String, unique=True, index=True)