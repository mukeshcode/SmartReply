# Pydantic & Data Validation – Notes

---

## Pydantic

Pydantic comes preinstalled with FastAPI. It is a Python library used for data modelling, data parsing, and efficient error handling.

---

### Data Modelling

Defining the structure, types, and rules of your data in a clear, declarative way — what fields exist in a particular object, what type each field is, and what optional constraints or defaults apply.

```python
from pydantic import BaseModel

class Book(BaseModel):
    id: int
    title: str
    author: str
    rating: int
```

---

### Data Parsing

Taking raw input data and converting it into the correct Python types based on the model.

For example, `Book(id="1", ...)` — even though `id` is passed as a string, Pydantic will automatically convert/parse it into the correct type (`int`) wherever possible. It throws an error only when conversion is impossible.

---

### Efficient Error Handling

Automatically detecting invalid data and returning clear, structured, human-readable errors.

---

## Pydantic in FastAPI

FastAPI uses Pydantic models to control, clean, and validate all incoming and outgoing data automatically.

Inheriting from `BaseModel` gives you several advantages:
- Data validation
- Automatic type conversion
- Structured errors
- Serialization via `book.dict()` / `book.json()`

```python
from pydantic import BaseModel, Field
from typing import Optional

class BookRequest(BaseModel):
    id: Optional[int] = None
    title: str = Field(min_length=3)
    author: str = Field(min_length=1)
    description: str = Field(min_length=1, max_length=100)
    rating: int = Field(gt=0, lt=5)

@app.post("/create_book")
async def create_book(book_request: BookRequest):
    new_book = Book(**book_request.dict())  # or .model_dump()
    # In large systems, separate the request model and the DB model
    BOOKS.append(new_book)
```

---

## Lesson 2 – Swagger UI Example (Optional)

Pydantic configurations to pre-populate the example section in the Swagger UI.

```python
from pydantic import BaseModel, Field
from typing import Optional

class BookRequest(BaseModel):
    id: Optional[int] = Field(description="Id not needed on create", default=None)
    title: str = Field(min_length=3)
    author: str = Field(min_length=1)
    description: str = Field(min_length=1, max_length=100)
    rating: int = Field(gt=0, lt=5)

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "A new book",
                "author": "codingwithroby",
                "description": "A new description of book",
                "rating": 5
            }
        }
    }
```

---

## Lesson 3 – Data Validation in Path Parameters

Data validation errors show up as `422 Unprocessable Entity`.

```python
from fastapi import FastAPI, Path

@app.get("/books/{book_id}")
async def read_book(book_id: int = Path(gt=0)):
    ...
```

---

## Lesson 4 – Data Validation in Query Parameters

```python
from fastapi import FastAPI, Query

@app.get("/books")
async def read_book(book_rating: int = Query(gt=0, lt=6)):
    ...
```