import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/clipping")

try:
    # Try connecting to PostgreSQL
    engine = create_engine(DATABASE_URL)
    # Ping the database to verify connectivity
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"PostgreSQL connection failed: {e}. Falling back to SQLite for preview.")
    DATABASE_URL = "sqlite:///./clipping.db"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()