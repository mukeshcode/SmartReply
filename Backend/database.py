from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import urllib.parse

SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:supabase9302@db.mjhuiizwxfwznfpfzywp.supabase.co:5432/postgres'
# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:isha@localhost:5432/SmartRply"
# from passlib.context import CryptContext
# from urllib.parse import quote_plus
# raw_password = "@Re$pEc+100_Fu11"
# encoded_password = urllib.parse.quote_plus(raw_password)
# SQLALCHEMY_DATABASE_URL = f"postgresql://postgres.wogagscwjuvmdeanahku:{encoded_password}@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()  

