# 📘 TypeScript Basics

**TypeScript = JavaScript + Types**

Just JavaScript, but you tell the code what type of value a variable holds. Catches bugs before you even run the code.

---


## ⚠️ Important — TypeScript is NOT bulletproof

> TypeScript only exists during development. The browser runs plain JavaScript — TypeScript is completely stripped away after compilation.

```
Your .tsx code  →  TS checks for errors  →  compiles to plain .js  →  browser runs it
```

This means — **TypeScript cannot catch runtime errors.** The most common case is API responses:

```ts
type User = {
  username: string
  age: number
}

const res = await fetch('/api/user')
const user: User = await res.json()  // TS just trusts you here, no real check

console.log(user.age.toUpperCase())  // 💥 crashes at runtime
// API maybe returned { username: "john", age: null } — TS had no idea
```

TypeScript says *"you told me it's a User, I trust you"* — and moves on. It cannot verify what actually comes over the network, from a database, or from user input.

**TypeScript is like a spell checker — it only helps while you're writing. The final output is plain JavaScript, spell checker not included.** 📄

---


## Why TypeScript?

```ts
// JavaScript — no rules, anything goes
let name = "John"
name = 123  // ✅ JS doesn't complain

// TypeScript — you define the type
let name: string = "John"
name = 123  // ❌ TS yells immediately — "this should be a string!"
```

---



## Common Types

```ts
let name: string = "John"
let age: number = 25
let isLoggedIn: boolean = true
let scores: number[] = [1, 2, 3]        // array of numbers
let tags: string[] = ["ai", "chat"]     // array of strings
```

---

## Object Types

```ts
type User = {
  username: string
  age: number
  isAdmin: boolean
}

const user: User = {
  username: "john",
  age: 25,
  isAdmin: false
}
```

---

## Function Types

```ts
function greet(name: string): string {
  return "Hello " + name
}

greet("John")  // ✅
greet(123)     // ❌ TS catches it — "123 is not a string"
```

---

## Optional Properties

```ts
type User = {
  username: string
  age?: number   // ? means optional, may or may not exist
}
```

---

## Union Types

```ts
// can be one OR the other
let id: string | number = "abc123"
id = 123  // ✅ also fine
```

---

## Readonly

```ts
// prevents reassignment — just a safety guard
type Props = Readonly<{
  children: React.ReactNode
}>
```

---

## What you'll see in Next.js

```tsx
// typing component props
type ButtonProps = {
  label: string
  onClick: () => void   // a function that takes nothing and returns nothing
}

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}

// typing useState
const [username, setUsername] = useState<string>('')
const [age, setAge] = useState<number>(0)
```

---

## TL;DR

- `: string`, `: number`, `: boolean` — basic types
- `type` — define shape of an object
- `?` — optional property
- `|` — can be this OR that
- `Readonly<>` — can't modify this
- TypeScript is a **developer tool only** — compiles to plain JS, browser never sees it
- TypeScript **cannot catch runtime errors** — it trusts you at API/network boundaries

---

*Don't stress about it. You'll pick it up naturally as you write more Next.js code* 😄