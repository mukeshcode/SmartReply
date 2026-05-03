from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime

class FriendRequest(Base):
    __tablename__ = 'friend_requests'

    id = Column(Integer, primary_key=True, index=True)
    sender_username = Column(String, ForeignKey('users.username'), nullable=False) 
    receiver_username = Column(String, ForeignKey('users.username'), nullable=False)
    status = Column(String, default='pending')  # pending | accepted | rejected
    created_at = Column(DateTime, default=datetime.utcnow)