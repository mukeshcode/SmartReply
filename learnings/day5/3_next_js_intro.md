# ⚡ Next.js Basics

## Setting Up a Project

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --no-src-dir
cd frontend
npm run dev
```

Without all these flags, it would ask us each question one by one interactively. The flags just say *"yes/no, don't ask me, just do it."*

### What each flag does

- `create-next-app@latest` — official Next.js project scaffolder, latest version
- `frontend` — name of the folder it'll create
- `--typescript` — use TypeScript instead of plain JavaScript
- `--tailwind` — set up Tailwind CSS automatically (instead of writing vanilla CSS)
- `--eslint` — add ESLint, catches code mistakes as you write
- `--app` — use the App Router (the modern Next.js way, which is why we have the `app/` folder)
- `--no-src-dir` — don't wrap everything inside a `src/` folder, keep it flat and simple

### npm vs npx

```
npm = downloads → installs permanently on our machine
npx = downloads → runs → deletes
```

You don't need `create-next-app` sitting on our machine forever — we only need it once to set up the project. So `npx` makes sense here. Think of it as renting a tool instead of buying it.

---

## Routes

Next.js uses a file-system based router — the folder structure **is** our routes. Create a folder inside `app/`, add a `page.tsx`, and that's our route.

```
app/page.tsx              →  localhost:3000/
app/signup/page.tsx       →  localhost:3000/signup
app/login/page.tsx        →  localhost:3000/login
app/some_random/page.tsx  →  localhost:3000/some_random
```

---

## `page.tsx`

This is the actual UI that gets rendered when we visit a route. Whatever we return from `page.tsx` is what the user sees.

`app/page.tsx` is special — it's the **root route**, the first thing that loads at `localhost:3000/`.

```tsx
export default function Home() {
  return <h1>SmartReply</h1>
}
```

- `function Home()` — just a regular JS function, any name works
- `default` — Next.js implicitly looks for the default export from `page.tsx` to know what to render
- `export` — makes it available for Next.js to pick up

---

## `layout.tsx`

A wrapper that wraps around our pages. The layout stays mounted, only the `{children}` part swaps when we navigate — fonts, metadata, navbar all load once and persist.

```
We go to /        → layout loads once, page.tsx slots into {children}
We go to /signup  → layout stays, only {children} swaps to signup/page.tsx
We go to /login   → layout stays, only {children} swaps to login/page.tsx
```

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>  {/* 👈 our page.tsx renders here */}
    </html>
  )
}
```

Think of it like a TV — the TV (layout) stays on, only the channel (page) changes. 📺

### Nested Layouts

Each folder can have its own `layout.tsx` and they nest into each other:

```
app/layout.tsx              → wraps everything
app/dashboard/layout.tsx    → wraps only dashboard routes
app/dashboard/page.tsx
app/dashboard/chats/page.tsx
app/dashboard/friends/page.tsx
```

The nesting looks like:
```
RootLayout
  └── DashboardLayout (sidebar for all dashboard routes)
        ├── DashboardPage
        ├── ChatsPage
        └── FriendsPage
```

Real use case for SmartReply — later when we build the dashboard, we'll want a sidebar that appears on all dashboard routes but never on `/login` or `/signup`. One `dashboard/layout.tsx` handles that without repeating anything. 😄