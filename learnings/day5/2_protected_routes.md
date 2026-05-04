# 🔒 How to Create Protected Routes

## Step 1 — Helper to extract and verify the token

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()  # a reusable object that tells FastAPI "expect a Bearer token in the Authorization header"

async def get_current_user(
    credentials:Annotated[HTTPAuthorizationCredentials, Depends(security)]  # HTTPAuthorizationCredentials is the type hint
):
    try:
        token = credentials.credentials  # pulls the token out of header "Authorization: Bearer <token>"
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('username')

        if username is None:
            raise HTTPException(status_code=401, detail='Could not validate user')
        return {'username': username}  # this is what the dependent route will receive as 'user'

    except JWTError:
        raise HTTPException(status_code=401, detail='Could not validate user')
```

> Code is straightforward, just read it once 🙂

---

## Step 2 — Use it as a dependency wherever you want a protected route

```python
user_dependency = Annotated[dict, Depends(get_current_user)]  # reusable code, no need to write Annotated... everywhere

@router.get('/get_message')
async def get_message(user: user_dependency):
    print(f"user : {user}")
    return {'msg' : 'hello'}
```

**How this works:** Whenever `/get_message` is called, `get_current_user` runs first. If token verification succeeds, you get back whatever was encoded in the token (username, etc.). If not — unauthorized error is sent. That's it!