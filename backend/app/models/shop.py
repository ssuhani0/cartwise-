import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Shop(Base):
    __tablename__ = "shops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address = Column(Text, nullable=False)
    area = Column(String(255), nullable=False)
    city = Column(String(255), nullable=False)
    pincode = Column(String(10), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    is_open = Column(Boolean, default=True)
    image_url = Column(Text, nullable=True)
    delivery_fee = Column(Float, default=0.0)
    min_order_amount = Column(Float, default=0.0)
    estimated_delivery_time = Column(String(50), default="30-40 mins")
    categories = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", backref="shops", lazy="selectin")
    products = relationship("Product", back_populates="shop", lazy="selectin", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="shop", lazy="selectin")

    def __repr__(self):
        return f"<Shop {self.name}>"
