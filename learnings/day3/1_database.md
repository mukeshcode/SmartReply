# Understanding `database.py` — The Single Source of Truth for Database Setup

It's a convention to centralize database setup in one place. Many files will need database access, and we don't want to repeat connection code or recreate engines/sessions everywhere — that risks inconsistencies.

So, `database.py` is created as a **single source of truth** for database connection, session creation, and the ORM base class. This is **clean architecture**.

> We write it once, touch it rarely, and import from it everywhere.

---

## What Problems Does This File Solve?

1. **How do we connect to the database?**
2. **How do we talk to the database safely?**
3. **How do we define ORM models (tables)?**

---

## The Code, Explained

### Imports

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
```

| Import | What it is |
|---|---|
| `create_engine` | A database connection factory — lets us reach the database |
| `sessionmaker` | Creates database sessions — needed to actually talk to the database |
| `declarative_base` | A base class that ORM models (like `Users`, `Chats`, `Messages`) inherit from, making Python classes behave like database tables |

---

### The Database URL

```python
SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/mydb'
```

This is where the database lives and how to connect to it. It contains:
- **DB type** — `postgresql`
- **Username & password** — `postgres:postgres123`
- **Host** — `localhost`
- **Port** — `5432`
- **Database name** — `mydb`

Think of it as the address + credentials of your database.

---

### The Engine

```python
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)
```

- Creates an object that **knows how to connect** to the database — but hasn't connected yet.
- `echo=True` is optional — it logs all SQL queries, which is great for learning.
- It is meant to be **created only once**.

---

### The Session Factory

```python
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

`SessionLocal` is a factory. When called (e.g. `db = SessionLocal()`), it gives you a new database session — a safe channel to talk to the database.

**Key parameters:**

- `bind=engine` — Sessions don't know how to reach the database on their own. This tells them to use the engine we created.
- `autocommit=False` — Nothing is saved to the database unless you explicitly say so:

  ```python
  db.add(user)   # nothing saved yet
  db.commit()    # now it's saved
  ```

  **Why is `autocommit=True` discouraged?**

  Consider a bank transfer:
  ```python
  db.add(debit_account_A)
  db.add(credit_account_B)
  ```
  You want **both to succeed, or neither to happen**. With `autocommit=False`, you control exactly when changes are committed — giving you atomicity and safety.

- `autoflush=False` — (`db.flush()` will be covered later)

---

### The Base Class

```python
Base = declarative_base()
```

- All database models will inherit from `Base`.
- Allows SQLAlchemy to **map Python classes to database tables**.

---

## Full File

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/mydb'

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
```

---

## Summary

| Piece | Role |
|---|---|
| `SQLALCHEMY_DATABASE_URL` | Address + credentials of the database |
| `engine` | Knows how to connect to the database |
| `SessionLocal` | Factory that creates safe sessions for database operations |
| `Base` | Parent class for all ORM models / tables |