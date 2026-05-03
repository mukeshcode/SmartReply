from pydantic import BaseModel

class SendFriendRequestSchema(BaseModel):
    receiver_username: str