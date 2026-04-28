# Status Codes – Notes

---

## Lesson 5 – Status Codes

An HTTP status code helps the client understand what happened on the server side.

---

### 1xx – Informational

Request is being processed. Used internally and not typically surfaced to developers.

Example flow:
```
Client  → POST /upload (headers only)
Server  → 100 Continue
Client  → Sends the file
Server  → 201 Created
```

---

### 2xx – Success

Request was successfully completed.

| Code | Meaning | Notes |
|------|---------|-------|
| 200 | OK | Standard success |
| 201 | Created | Resource was created |
| 204 | No Content | Request succeeded but returned nothing — commonly used with PUT/DELETE |

---

### 3xx – Redirection

Further action must be taken to complete the request.

---

### 4xx – Client Errors

An error was caused by the client.

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Unprocessable Entity |

---

### 5xx – Server Errors

An error occurred on the server.

| Code | Meaning |
|------|---------|
| 500 | Internal Server Error |

---

## HTTP Exception

Used when you want to raise an exception manually and send a status code along with a detail message.

```python
from fastapi import FastAPI, HTTPException

@app.get("/endpoint")
async def some_endpoint():
    ...
    raise HTTPException(detail="Item not found", status_code=404)
```

---

## Explicit Success Status Codes

You can declare the expected success status code directly on the route using `starlette.status`.

> **Note:** FastAPI is built on top of Starlette, a lightweight ASGI web framework. Starlette handles the core web mechanics — HTTP requests, routing, responses, middleware, WebSockets, and background tasks.
>
> Request flow:
> ```
> FastAPI Code
>   → FastAPI Layer (validation, OpenAPI, dependency injection)
>   → Starlette Layer (routing, middleware, requests, responses)
>   → ASGI Server (Uvicorn / Hypercorn)
>   → Operating System
> ```

```python
from starlette import status

@app.get("/books", status_code=status.HTTP_200_OK)
...

@app.post("/books", status_code=status.HTTP_201_CREATED)
...

@app.put("/update", status_code=status.HTTP_204_NO_CONTENT)
...

@app.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
...
```