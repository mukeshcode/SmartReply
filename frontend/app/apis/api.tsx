// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth token from localStorage
const getToken = () => localStorage.getItem('smartreply_token');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

export const signup = async (form: any) => {
    let res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if(!res.ok){
        throw new Error("Signup failed")
    }
}

export const login = async (form: any) => {
     let res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // now sends username + password
    });
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    else{
        throw new Error("Login failed.")
    }
}
// ─────────────────────────────────────────
// SEARCH USERS
// GET /friends/search?username=query
// ─────────────────────────────────────────
export const searchUsers = async (username: string) => {
    const res = await fetch(`${BASE_URL}/friends/search?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: authHeaders()
    });

    if (!res.ok) throw new Error('No users found');
    return res.json();
};

// ─────────────────────────────────────────
// SEND FRIEND REQUEST
// POST /friends/friend-requests
// ─────────────────────────────────────────
export const sendFriendRequest = async (receiver_username: string) => {
    const res = await fetch(`${BASE_URL}/friends/friend-requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ receiver_username })
    });

    if (!res.ok) throw new Error('Failed to send friend request');
    return res.json();
};

// ─────────────────────────────────────────
// GET PENDING REQUESTS
// GET /friends/friend-requests/pending
// ─────────────────────────────────────────
export const getPendingRequests = async () => {
    const res = await fetch(`${BASE_URL}/friends/friend-requests/pending`, {
        method: 'GET',
        headers: authHeaders()
    });

    if (!res.ok) throw new Error('Failed to fetch pending requests');
    return res.json();
};

// ─────────────────────────────────────────
// RESPOND TO FRIEND REQUEST
// PUT /friends/friend-requests/{request_id}?response=accepted|declined
// ─────────────────────────────────────────
export const respondToFriendRequest = async (request_id: number, response: 'accepted' | 'declined') => {
    const res = await fetch(`${BASE_URL}/friends/friend-requests/${request_id}?response=${response}`, {
        method: 'PUT',
        headers: authHeaders()
    });

    if (!res.ok) throw new Error('Failed to respond to friend request');
    return res.json();
};

// ─────────────────────────────────────────
// FETCH MY FRIENDS
// GET /friends/fetch_my_friends
// ─────────────────────────────────────────
export const fetchMyFriends = async () => {
    const res = await fetch(`${BASE_URL}/friends/fetch_my_friends`, {
        method: 'GET',
        headers: authHeaders()
    });

    if (!res.ok) throw new Error('Failed to fetch friends');
    return res.json();
};



export const logout = async (username: string) => {
     let res = await fetch(`${BASE_URL}/auth/logout?username = ${username}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    else{
        throw new Error("Login failed.")
    }
}