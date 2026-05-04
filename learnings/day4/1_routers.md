# FastAPI Routers

## Why Use Routers?

To keep code readable and maintainable. Without routers, all API endpoints for users, chats, messages, etc. would pile up in `main.py` — making it very cluttered and hard to navigate.

The solution is to create a `routers/` folder and split endpoints into their own files:

```
routers/
├── users.py
├── chats.py
└── messages.py
```

Each file owns its own API endpoints. `main.py` stays clean.

---

## How to Use It

### In `routers/users.py`

```python
from fastapi import APIRouter

router = APIRouter(
    prefix='/users',       # all routes in this file will be prefixed with /users
    tags=['users'],        # groups endpoints together in the auto-generated /docs UI
)

@router.get('/signup')     # full path becomes: GET /users/signup
async def signup():
    ...
```

### In `main.py`

```python
from fastapi import FastAPI
from routers import users, chats, messages

app = FastAPI()

app.include_router(users.router)
app.include_router(chats.router)
app.include_router(messages.router)
```

`include_router()` registers all the routes defined in that router with the main app — as if you had written them directly in `main.py`.

---

## `prefix` and `tags` (Important)

These are optional but almost always used in real projects:

| Parameter | What it does | Example |
|---|---|---|
| `prefix` | Prepends a path to every route in the router | `prefix='/users'` → `/users/signup`, `/users/login` |
| `tags` | Groups endpoints in the `/docs` UI for readability | `tags=['users']` |

Without `prefix`, you'd have to manually write `/users/` at the start of every route inside the file. With it, you write it once on the router and keep individual routes short.

---

## Summary

```
routers/
├── users.py     →  router = APIRouter(prefix='/users', tags=['users'])
├── chats.py     →  router = APIRouter(prefix='/chats', tags=['chats'])
└── messages.py  →  router = APIRouter(prefix='/messages', tags=['messages'])

main.py
└── app.include_router(users.router)
    app.include_router(chats.router)
    app.include_router(messages.router)
```