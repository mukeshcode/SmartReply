# SQLAlchemy — Working with Databases in Python

## What is SQLAlchemy?

SQLAlchemy is a Python library for working with relational databases. It provides a high-level, Pythonic way to interact with databases such as PostgreSQL, MySQL, SQLite, SQL Server, and Oracle — without having to write raw SQL for every operation (though you still can when needed).

SQLAlchemy supports both:
- **High-level ORM mapping** — work with Python objects instead of SQL
- **Low-level SQL expression building** — write SQL-like expressions in Python

> In real systems, ORMs are used 80–90% of the time. Raw SQL is reserved for edge cases and higher optimization.

**Installation:**
```
uv add sqlalchemy psycopg
```

---

## What is an ORM?

An ORM (Object Relational Mapper) is a layer that **maps database tables to objects** in your programming language.

**Why use an ORM?**

| Benefit | Description |
|---|---|
| Developer productivity | Write Python, not SQL |
| Maintainability & Readability | Code is cleaner and easier to follow |
| Database Safety | ORM handles protections like SQL injection |
| Database Agnostic | Same ORM code works with PostgreSQL, MySQL, SQLite, SQL Server, etc. |

---

## Pydantic vs SQLAlchemy — Who Does What?

These two libraries work at **different layers** and solve different problems:

| Concern | Tool | Where it lives |
|---|---|---|
| Data validation & serialization | **Pydantic** | API boundary (request bodies, response schemas) |
| Database persistence | **SQLAlchemy ORM** | Persistence layer |

Pydantic doesn't know about indexes, foreign keys, joins, transactions, or managing persistence. SQLAlchemy doesn't validate incoming request data. They complement each other.

**Naming convention to keep them separate:**
- Use `models.py` for SQLAlchemy ORM models
- Use `schemas.py` for Pydantic models

---

## The Request Flow

Here's how a typical API request moves through both layers:

```
1. Client sends JSON
        ↓
2. Pydantic validates the request body
        ↓
3. SQLAlchemy persists to the database
        todo = Todo(**todo_create.model_dump())
        db.add(todo)
        db.commit()
        ↓
4. Return a Pydantic response schema — NOT the ORM object directly
   (ORM objects are not JSON-safe, contain internal state, and can expose unwanted fields)
```

---

## Setting Up: `database.py`

See [`database.py` — The Single Source of Truth](./README.md) for a full breakdown of the engine, session factory, and base class.

---

## Defining an ORM Model (`models.py`)

An ORM model is a Python class that represents a database table. Each attribute maps to a column.

```python
from database import Base
from sqlalchemy import Column, Integer, String, Boolean

class Todos(Base):
    __tablename__ = 'todos'          # the actual table name inside the database

    id          = Column(Integer, primary_key=True, index=True)  # index improves query performance slightly
    title       = Column(String)
    description = Column(String)
    priority    = Column(Integer)
    complete    = Column(Boolean, default=False)
```

- `Base` is imported from `database.py` — inheriting from it tells SQLAlchemy this class is a database table.
- `__tablename__` sets what the table is called inside the database.
- Each `Column(...)` defines the column's data type and optional constraints (`primary_key`, `index`, `default`).

When `models.Base.metadata.create_all(bind=engine)` is called at startup, SQLAlchemy reads all classes that inherit from `Base` and creates their tables in the database if they don't already exist.

---

## Getting a Database Session in FastAPI

**The problem:** How do we safely give each API request its own database session, and always close it afterward?

**The solution:** FastAPI's dependency injection system.

```python
from fastapi import FastAPI
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session

app = FastAPI()

models.Base.metadata.create_all(bind=engine)
# Creates tables if they don't already exist

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### How `get_db()` works

`yield` turns `get_db` into a **generator** — a function that can pause and resume. This enables the "open → use → close" lifecycle:

```python
# Simplified example of how yield works:
def f():
    yield 1
    yield 2
    yield 3

gen = f()
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3
```

Applied to `get_db`, FastAPI does this automatically for each request:

```
1. Call get_db()
2. Advance generator until yield → open the session
3. Inject the yielded session (db) into the endpoint function
4. Run the endpoint
5. Resume generator after yield → execute db.close() in finally block
```

> Open a connection when it's needed, close it as soon as it's done. Never leak a session.

### Using it in an endpoint

```python
# db: Session = Depends(get_db)
# db: Annotated[Session, Depends(get_db)]  ← type hint + dependency rule combined

# Both mean: "The thing I expect is a SQLAlchemy Session — to get it, call get_db()"
```

---

## Common Database Operations

### Reading

```python
db.query(Todos).all()                                    # fetch all rows
db.query(Todos).filter(Todos.id == todo_id).first()      # fetch one row by condition
```

> Fetch what you need and return fast.

### Creating

```python
todo_model = Todos(**todo.dict())
db.add(todo_model)   # db is aware of the pending change, but nothing is saved yet
db.commit()          # the transaction happens now — data is written to the database
```

### Updating

```python
# Fetch the existing record, modify it, then re-save
db.add(todo)
db.commit()
```

### Deleting

```python
db.query(Todos).filter(Todos.id == todo_id).delete()
db.commit()
```

---

## Summary

```
SQLAlchemy
├── Engine          → knows how to connect to the database
├── Session         → the safe channel to send queries and commit changes
├── ORM Models      → Python classes that map to database tables
└── Base            → parent class all models inherit from

FastAPI integration
└── get_db()        → dependency that opens a session per request and closes it after
```