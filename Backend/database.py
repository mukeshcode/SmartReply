from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

SQLALCHEMY_DATABASE_URL = "postgresql://postgres.wogagscwjuvmdeanahku:53HSe0NF6KErp9Vp@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:neeraj@localhost:5432/mydb"
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()  

