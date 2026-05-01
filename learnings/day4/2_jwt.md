# Authentication & Authorization with JWT

## Core Concepts

**Authentication** — Verifying identity. Is this user who they claim to be?

**Authorization** — Checking permissions. Does this user have access to this resource?

---

## Bearer Token

Whoever *bears* (has) this token is considered a verified user of the application. No extra proof is needed beyond possessing the token — which means **this token must never be leaked**.

---

## JWT — JSON Web Token

A JWT is a bearer token. If someone has your JWT (issued by the server — you don't generate it yourself), they are **you** in the eyes of the server.

A JWT looks like this:

```
aaaaaaa.bbbbbbbb.cccccccc
```

That is: `base64url(header) . base64url(payload) . base64url(signature)`

Three parts, separated by `.`:

---

### 1. Header

Contains the token type and the signing algorithm used by the server.

```json
{
    "alg": "HS256",
    "typ": "JWT"
}
```

Encoded into **Base64URL** — a web-safe variant of Base64 that handles special characters like `/` and `+` that would otherwise break URLs.

---

### 2. Payload

Contains **claims** — data about the user. There are three types:

**a. Registered claims** — predefined, recommended but not mandatory:

| Claim | Meaning |
|---|---|
| `iss` | Issuer — who issued this JWT (e.g. `thisapp.com`) |
| `sub` | Subject — who the token is about (e.g. `user_id`) |
| `exp` | Expiration time — **very important!** |
| `iat` | Issued at |

**b. Public claims** — custom claims intended to be shared publicly. They should be registered with the [IANA JWT Registry](https://www.iana.org/assignments/jwt/jwt.xhtml) or defined as a collision-resistant URI to avoid naming conflicts with other systems (e.g. `https://myapp.com/claims/role`).

**c. Private claims** — application-specific data agreed upon between your server and client, not registered anywhere (e.g. `role`, `team_id`).

Example payload:

```json
{
    "sub": "user_123",
    "email": "someone@somewhere.com",
    "role": "user",
    "exp": 1720000000,
    "iat": 1719996400
}
```

Also Base64URL encoded.

---

### 3. Signature

Created by hashing the encoded header + encoded payload with a secret key, using the algorithm specified in the header:

```
Signature = HMAC-SHA256(
    base64url(header) + '.' + base64url(payload),
    secret_key
)
```

The result is then Base64URL encoded and appended as the third part of the JWT.

The **secret key** can be anything — it lives on the server and the client must **never** know it.

> **Fun fact:** You can decode any JWT at [https://jwt.io](https://jwt.io) and read the header and payload. Try it!

---

## Is JWT Actually Secure If Anyone Can Decode It?

**Yes.** Readability is not the same as being untrustworthy.

JWT security is based on **integrity + authenticity**, not secrecy.

Consider this: a user changes their payload from `{"role": "user"}` to `{"role": "admin"}`, re-encodes it, and sends it as a JWT. Will it work?

**No.** The server will instantly reject it. The signature was created with the secret key — changing even a single character in the header or payload produces a completely different signature. The server recomputes the signature on every request and compares. Tampering is immediately detected.

> **However** — if someone steals your JWT, they *are* you. Don't let it leak.
> JWT is not safe over plain HTTP, which is vulnerable to **MITM (Man-in-the-Middle) attacks**. Always use **HTTPS**.

---

## Typical Authentication & Authorization Flow

```
1. User logs in (username/password, OAuth, SSO, etc.)
2. Server authenticates the user
3. Server issues a JWT
4. Returns the JWT to the client
5. Every subsequent request includes the JWT in the header:
        Authorization: Bearer <token>
6. Server validates each request by:
        a. Verifying the signature
        b. Checking expiration
        c. Extracting user info
        d. Checking authorization (permissions)
```

### Where Should the Client Store the JWT?

| Storage | Pros | Cons |
|---|---|---|
| `localStorage` | Simple | Vulnerable to XSS attacks |
| `httpOnly` cookie | Safe from JS/XSS | Requires CSRF protection |

`httpOnly` cookies are generally the safer choice for production.

---

## Implementation in Python (FastAPI)

### Installation

```
uv add "python-jose[cryptography]"
```

`python-jose` is a Python implementation of JOSE standards — one of the trusted tools for JWT in real production systems.

---

### Setup

```python
from jose import jwt, JWTError          # ← from jose, not json
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

SECRET_KEY = 'generated_with_openssl'   # openssl rand -hex 32
ALGORITHM = 'HS256'
```

**Why `openssl rand -hex 32`?**
- Generates 32 bytes = 256-bit key, converted to hexadecimal
- `openssl` uses OS entropy — cryptographically secure randomness backed by decades of security review
- Brute-forcing a 256-bit key would take longer than the age of the universe

**Why `timezone.utc`?**
`datetime.now()` gives you local machine time, which varies by server location and DST. `datetime.now(timezone.utc)` always gives the current UTC time — a universal reference point. JWT `exp` is defined as UTC, so this must match.

---

### Token Schema (Pydantic)

```python
class Token(BaseModel):
    access_token: str
    token_type: str
```

---

### Creating a JWT

```python
def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
```

---

### Decoding a JWT (Verifying a User)

Decoding is how the server identifies and authenticates a user on every protected request.

```python
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from typing import Annotated

oauth2_bearer = OAuth2PasswordBearer(token_url='/token')
```

`OAuth2PasswordBearer` tells FastAPI: *"look for a Bearer token in the `Authorization` header of incoming requests."* It doesn't validate the token itself — it just extracts it and passes it along as a dependency.

```python
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')    # encoded as 'sub', not 'username'
        user_id: int = payload.get('id')
        if username is None or user_id is None:
            raise HTTPException(status_code=401, detail='Could not validate user')
        return {'username': username, 'user_id': user_id}
    except JWTError:
        raise HTTPException(status_code=401, detail='Could not validate user')
```

> Note: `payload.get('sub')` — not `'username'`. The claim was encoded under the key `'sub'`, so that's what you read back.

---

## Summary

```
JWT = base64url(header) . base64url(payload) . base64url(signature)

Security model:
├── Signature   → proves the token hasn't been tampered with
├── Expiration  → limits the damage if a token is leaked
└── HTTPS       → prevents the token from being stolen in transit

FastAPI flow:
├── POST /token          → authenticate user → return JWT
└── Protected endpoints  → Depends(get_current_user) → decode JWT → authorize
```