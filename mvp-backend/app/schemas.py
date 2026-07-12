from pydantic import BaseModel

class StoreCreate(BaseModel):
    name: str
    instagram_handle: str

class StoreResponse(StoreCreate):
    id: int

    class Config:
        from_attributes = True