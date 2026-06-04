import uuid
from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    image_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    products = relationship("Product", back_populates="category", lazy="selectin")

    def __repr__(self):
        return f"<Category {self.name}>"
