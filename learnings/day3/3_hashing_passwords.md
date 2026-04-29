# Password Hashing & Authentication

## Two Threats to Protect Against

### 1. Database is Compromised(now, we are doing this one)
If an attacker gains access to your database, you don't want them reading raw passwords. The solution is to **hash passwords with `bcrypt`** — so the actual password is never stored anywhere.

### 2. Interception in Transit(this one done by HTTPS)
If an attacker intercepts network traffic, you don't want them reading the password mid-flight. The solution is **HTTPS (TLS encryption)** — the frontend sends the password in plain text, but any middleman only sees encrypted gibberish, not the actual password.

> These are two independent solutions for two different attack surfaces. Hashing protects what's stored; HTTPS protects what's sent.

---

## Installation

```
uv add passlib bcrypt==4.0.1
```

> `bcrypt==4.0.1` is pinned because newer versions can have compatibility issues with `passlib`.

---

## Setting Up the Hashing Context

```python
from passlib.context import CryptContext

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
```

`CryptContext` is a unified interface for hashing and verifying passwords. Here it's configured to use `bcrypt` as the hashing scheme.

---

## Hashing a Password

```python
hashed_password = bcrypt_context.hash(password)
```

Call this when a user registers. Store `hashed_password` in the database — **never store the plain text password**.

---

## Authenticating a User

```python
user = db.query(Users).filter(Users.username == username).first()

if not user:
    return False
if not bcrypt_context.verify(password, user.hashed_password):
    return False

return True
```

Two checks happen in order:

1. **Does this user exist?** — query the database by username. If no record is found, reject immediately.
2. **Is the password correct?** — `bcrypt_context.verify(password, user.hashed_password)` hashes the incoming plain text password and compares it against the stored hash. Returns `True` if they match, `False` otherwise.

> `verify()` never un-hashes the stored password. It re-hashes the input and compares — that's what makes bcrypt safe.

---

## Summary

```
Registration flow
└── bcrypt_context.hash(password) → store hashed_password in DB

Login flow
├── Query user by username → not found? reject
└── bcrypt_context.verify(plain, hashed) → no match? reject → else authenticate
```