# 🚀 UV Environment Setup Guide

This document provides a complete step-by-step guide to install `uv`, set up a virtual environment, and manage dependencies using a `uv.lock` file.

---

## 📦 1. Install `uv`

Install `uv` using pip:

```bash
pip install uv
```

Verify installation:

```bash
uv --version
```

---



## 🧪 2. Create a Virtual Environment

Create a virtual environment using `uv`:

```bash
uv venv .venv
```



---

## ▶️ 3. Activate the Virtual Environment

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

---

## 📥 4. Install Dependencies from `uv.lock`

If your project already contains a `uv.lock` file, install all dependencies with:

```bash
uv sync
```

---

## 🔄 6. Add New Dependencies

To add a new package:

```bash
uv add package_name
```

Example:

```bash
uv add fastapi
```

---

## 🔒 7. Update Lock File

After adding or modifying dependencies:

```bash
uv lock
```

---

## 🧠 Summary

* `uv venv` → Create virtual environment
* `uv sync` → Install dependencies from `uv.lock`
* `uv add` → Add new dependency
* `uv lock` → Update lock file

---

## 🎯 Quick Start (TL;DR)

```bash
pip install uv
uv venv .venv
.venv\Scripts\activate   # (Windows)
uv sync
```

---

## 🎉 You're Ready!

Your environment is now fully set up using `uv`. Happy coding!
