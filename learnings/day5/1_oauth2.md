# 🔐 OAuth2 and HTTPBearer

## What is OAuth2?

**Open Authorization 2.0** is a full fledged protocol  that defines how authorization should be done. It is a protocol that lets an app access a user's data **without touching their password directly**.

E.g. "Login with Gmail / GitHub" — Gmail hands the website a token on your behalf. That token also carries **scopes** (permissions you approved, like accessing your email or profile). The app then uses it to call Google's APIs and fetch only what you allowed.

> 💡 **Core idea:** Share an access token, not your password.

## HTTP Bearer?
It is just a helper, not a full-fledged protocol that defines how authorization should be done.
It is simply a function that extracts the Bearer token from the Authorization header. (Good for our use case 😄)

(We may switch to OAuth2 later, if we think of enabling login with Gmail / GitHub / etc.)
---

## How to use in FastAPI?

FastAPI gives you `OAuth2PasswordRequestForm` (for your login endpoint) and `OAuth2PasswordBearer` (to extract the token from request headers). The catch — your login endpoint must accept **form data**, not JSON.

Since we're already sending JSON and don't want to change that, we use **HTTPBearer** instead. Same idea, no form-data drama.

> ⚠️ `tokenUrl` in `OAuth2PasswordBearer` is just for Swagger docs — it doesn't enforce anything in your code.(the code for this is there in day 4 :| )


## ✅ HTTPBearer — What we use instead(Not a full fledged protocol, just a helper to extract Bearer Token from the Header)


```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials  # pulls the token out of "Authorization: Bearer <token>"
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('username')

        if username is None:
            raise HTTPException(status_code=401, detail='Could not validate user')
        return {'username': username}

    except JWTError:
        raise HTTPException(status_code=401, detail='Could not validate user')
```
---

## 🆚 Quick Comparison

| | `OAuth2PasswordBearer` | `HTTPBearer` |
|---|---|---|
| Login format | Form data only | JSON, anything |
| OAuth2 spec compliant | ✅ | ❌ |
| "Login with Google" flows | ✅ | ❌ |
| Simple JWT APIs | Works (with friction) | ✅ Easier |

---

## 🧑‍💻 Old vs New — `Depends()`
**Need to correct in our code**

```python
# Old way — db's "default value" is technically a Depends object. Misleading.
def route(db: Session = Depends(get_db)): ...

# New way — Annotated cleanly separates type from metadata. No fake defaults.
def route(db: Annotated[Session, Depends(get_db)]): ...
```

Both work, but `Annotated` is the recommended approach going forward.

---

## 🗂️ Summary

- OAuth2 = full protocol for delegated access (Login with Google, etc.)
- `OAuth2PasswordBearer` needs form data → send JSON → 422 error
- `HTTPBearer` = simpler, works with JSON login, you handle verification yourself
- Use `Annotated[Type, Depends(...)]` over the old default-value style

---
