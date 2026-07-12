from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import models, schemas
from typing import List

# Import our database files
from . import models
from .database import engine, SessionLocal

# This line tells SQLAlchemy to create the tables in Postgres!
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marketplace MVP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js URL
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],
)

# Dependency: This opens a DB connection per request and closes it after
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "¡Hola! The API is running."}

@app.post("/stores/", response_model=schemas.StoreResponse)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    # 1. Convert the incoming data into a database model
    db_store = models.Store(name=store.name, instagram_handle=store.instagram_handle)
    
    # 2. Add it to the database session and save it
    db.add(db_store)
    db.commit()
    
    # 3. Refresh to get the new ID assigned by PostgreSQL
    db.refresh(db_store)
    
    return db_store

@app.get("/stores/", response_model=List[schemas.StoreResponse])
def read_stores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Reach into the database and grab all stores
    stores = db.query(models.Store).offset(skip).limit(limit).all()
    return stores