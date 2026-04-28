# FastAPI Basics – Notes

---

## Overview

### What is FastAPI?
FastAPI is a modern Python web framework used to build high-performance RESTful APIs.

### What is an API?
An API (Application Programming Interface) is a contract that allows two software systems to communicate with each other.

### What is REST?
REST (Representational State Transfer) is an architectural style for designing APIs.

- Not a protocol
- Not a library
- A set of design principles

### What is a RESTful API?
An API that follows REST principles.

---

## Core REST Principles

### 1. Resource-Based
Everything is treated as a resource and identified using a URL.

```
/users
/users/52
```

### 2. Uses Standard HTTP Methods

- GET → Read data
- POST → Create data
- PUT → Update (full)
- PATCH → Update (partial)
- DELETE → Remove data

### 3. Stateless

- Each request contains all required information
- Server does not store client state
- Authentication must be sent with every request

### 4. Standard Data Format

- JSON (most common)
- XML (older systems)

### 5. Proper Use of HTTP Status Codes

```
200 → OK
201 → Created
400 → Bad Request
401 → Unauthorized
404 → Not Found
500 → Server Error
```

---

## Other API Architectures

- SOAP
- RPC
- GraphQL
- Event-driven APIs
- WebSockets

---

## Why FastAPI is Called Modern

### 1. Type Safety
FastAPI uses Python type hints to automatically validate data.

Why this matters:
- Automatic validation → No need to write manual checks
- Fewer runtime errors → Wrong data types are rejected early
- Better developer experience → IDE autocomplete & type checking
- Clear API contracts → Input/output structure is well-defined
- Self-documenting code → Types make code easier to understand

### 2. Automatic Documentation
- Swagger UI → `/docs`
- OpenAPI spec → auto-generated

### 3. Async Support
- Handles high concurrency efficiently

### 4. Built-in Validation
- Uses Pydantic models
- Clear error messages

### 5. Standards First
FastAPI is built on top of modern standards: OpenAPI, JSON Schema, OAuth2, JWT, ASGI.

---

## Lesson 1 – Getting Started

### Installation

```bash
pip install fastapi uvicorn
```

### First API (GET)

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

### Running the server

```bash
uvicorn main:app --reload
```

---

## Lesson 2 – Path Parameters

### What are Path Parameters?

- Values passed directly in the URL
- Used to identify a specific resource

```
/users/{user_id}
/orders/{order_id}
```

### Example

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}
```

### Rules

- Path parameter names must match function parameters
- Type hints enforce validation

### Route Order Matters

Wrong:
```
/users/{user_id}
/users/vip_users
```

Correct:
```
/users/vip_users
/users/{user_id}
```

### Note

`/users` and `/users/` are different URLs.

---

## Lesson 3 – Query Parameters

### What are Query Parameters?

- Parameters passed after `?`
- Used for filtering, sorting, pagination

### Key Idea

| Type  | Purpose | Example |
|-------|---------|---------|
| Path  | Which resource | `/users/42` |
| Query | How to get it  | `/users?limit=10&sort=newest` |

### Examples

```
/orders/105
/users?active=true&limit=20&sort=newest
/users/42/posts
/products?q=laptop
/users/42/orders?status=completed&page=2
```

### Example

```python
@app.get("/users")
async def get_users(active: bool = True, limit: int = 10, sort: str = "newest"):
    return {"active": active, "limit": limit, "sort": sort}
```

---

## Lesson 4 – POST & Request Body

### POST Method

- Used to create data
- Accepts request body (JSON)

### Incorrect

```python
@app.post("/books")
async def create_book(book):
    return book
```

### Using `Body()`

```python
from fastapi import Body

@app.post("/books")
async def create_book(book: dict = Body()):
    return book
```

### Best Practice

```python
from pydantic import BaseModel

class Book(BaseModel):
    title: str
    author: str

@app.post("/books")
async def create_book(book: Book):
    return book
```

### Parameter Source Rules

| Condition | Source |
|-----------|--------|
| Matches URL | Path |
| Pydantic model | Body |
| Simple type | Query |

Override with: `Path()`, `Query()`, `Body()`

---

## Lesson 5 – PUT & DELETE

### PUT

```python
@app.put("/books/{book_id}")
async def update_book(book_id: int):
    return {"book_id": book_id}
```

### DELETE

```python
@app.delete("/books/{book_id}")
async def delete_book(book_id: int):
    return {"deleted": book_id}
```

### Summary

| Method | Body |
|--------|------|
| GET    | No body |
| POST   | Has body |
| PUT    | Has body |
| DELETE | No body |

---

## Final Takeaway

- Path → identify resource
- Query → filter/control response
- Body → send structured data
- Pydantic → best practice