# 🪝 React Hooks

Hooks are special functions that let us add features to our components — like tracking values, navigating between pages, etc. They always start with `use`.

> ⚠️ Hooks only work inside `'use client'` components — they need the browser.

---

## `useState` — tracking values that change

When a value changes, the component(not the complete page, otherwise it would be too inefficient) **re-renders** automatically with the new value.

```tsx
const [username, setUsername] = useState('')
//     ↑ current value   ↑ function to update it   ↑ starting value
```

When the user types in an input:
```tsx
<input onChange={e => setUsername(e.target.value)} />
// e = the event
// e.target.value = what the user typed
// setUsername updates the username value → page re-renders
```

Full example:
```tsx
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')

// when button is clicked, username and password already have the latest values
async function handleLogin() {
  console.log(username, password)
}
```

---

## `useRouter` — navigating programmatically

Lets us navigate to a different route without the user clicking a link.

```tsx
const router = useRouter()

router.push('/login')    // go to /login
router.push('/signup')   // go to /signup
router.back()            // go back (like browser back button)
```

Without `useRouter`, we'd have to use an `<a>` tag or `<Link>` — but those require the user to click. `useRouter` lets us navigate from inside a function, like after a successful login:

```tsx
async function handleSignup() {
  const res = await fetch('http://localhost:8000/auth/signup', { ... })

  if (!res.ok) { alert('Signup failed'); return }

  router.push('/login')  // ✅ automatically take user to login on success
}
```

---

## TL;DR

| Hook | What it does |
|---|---|
| `useState` | Tracks a value, re-renders page when it changes |
| `useRouter` | Lets us navigate between routes programmatically |