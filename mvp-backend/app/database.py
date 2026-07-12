import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load the credentials from the .env file
load_dotenv() 

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# The 'engine' manages the actual connection to PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# The 'session' is your temporary workspace for making queries (adding/reading data)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All of your future database tables will inherit from this Base class
Base = declarative_base()