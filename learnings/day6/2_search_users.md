# backend/routers/users.py

@router.get("/users/search")
async def search_users(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(
        User.username.ilike(f"%{username}%"),
        User.id != current_user.id  # exclude self
    ).all()
    return users