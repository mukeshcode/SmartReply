'use client';
import { useState, useEffect, useRef } from 'react';
import {
    searchUsers,
    sendFriendRequest,
    getPendingRequests,
    respondToFriendRequest,
    fetchMyFriends
} from '../apis/api';

interface User {
    username: string;
    emailid: string;
}

interface FriendRequest {
    request_id: number;
    from: string;
    created_at: string;
}

interface Friend {
    sender_username: string;
    receiver_username: string;
    status: string;
}

interface Message {
    from: 'me' | 'them';
    text: string;
    time: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Decode JWT to get username
const decodeToken = (): { username: string } | null => {
    try {
        const token = localStorage.getItem('smartreply_token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.sub || payload.username || '',
        };
    } catch {
        return null;
    }
};

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [showRequests, setShowRequests] = useState(false);
    const [msg, setMsg] = useState('');

    // Chat state
    const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [wsConnected, setWsConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const currentUser = decodeToken();

    // ── WebSocket setup ──────────────────────────────────────
    useEffect(() => {
        if (!currentUser?.username) return;

        const wsUrl = `${BASE_URL.replace('http', 'ws')}/ws?user_name=${currentUser.username}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setWsConnected(true);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Incoming message format: { from: sender_username, message: "..." }
                const senderKey = data.from || 'unknown';
                const newMsg: Message = {
                    from: 'them',
                    text: data.message || data,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages((prev) => ({
                    ...prev,
                    [senderKey]: [...(prev[senderKey] || []), newMsg],
                }));
            } catch {
                // plain text fallback
            }
        };

        ws.onclose = () => setWsConnected(false);
        ws.onerror = () => setWsConnected(false);

        return () => ws.close();
    }, [currentUser?.username]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeFriend]);

    // ── Data loading ─────────────────────────────────────────
    const loadPendingRequests = async () => {
        try { setPendingRequests(await getPendingRequests()); }
        catch (err) { console.error(err); }
    };

    const loadFriends = async () => {
        try { setFriends(await fetchMyFriends()); }
        catch (err) { console.error('Failed to load friends', err); }
    };

    useEffect(() => {
        loadPendingRequests();
        loadFriends();
    }, []);

    // ── Handlers ─────────────────────────────────────────────
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            setSearchResults(await searchUsers(searchQuery));
        } catch {
            setSearchResults([]);
            setMsg('No users found');
        }
    };

    const handleSendRequest = async (receiver_username: string) => {
        try {
            await sendFriendRequest(receiver_username);
            setMsg(`Friend request sent to ${receiver_username} ✅`);
        } catch { setMsg('Failed to send request'); }
    };

    const handleAccept = async (request_id: number) => {
        try {
            await respondToFriendRequest(request_id, 'accepted');
            setMsg('Friend request accepted ✅');
            loadPendingRequests();
            loadFriends();
        } catch { setMsg('Failed to accept'); }
    };

    const handleReject = async (request_id: number) => {
        try {
            await respondToFriendRequest(request_id, 'declined');
            setMsg('Friend request rejected');
            loadPendingRequests();
        } catch { setMsg('Failed to reject'); }
    };

    const getFriendName = (friend: Friend): string =>
        friend.sender_username === currentUser?.username
            ? friend.receiver_username
            : friend.sender_username;

    const handleSendMessage = () => {
        if (!chatInput.trim() || !activeFriend || !wsRef.current) return;
        if (wsRef.current.readyState !== WebSocket.OPEN) return;

        const friendName = getFriendName(activeFriend);

        const payload = JSON.stringify({
            receiver_name: activeFriendName,
            message: chatInput.trim(),
        });

        wsRef.current.send(payload);

        const newMsg: Message = {
            from: 'me',
            text: chatInput.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => ({
            ...prev,
            [friendName]: [...(prev[friendName] || []), newMsg],
        }));

        setChatInput('');
    };

    const activeFriendName = activeFriend ? getFriendName(activeFriend) : null;
    const activeMessages = activeFriendName ? (messages[activeFriendName] || []) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex gap-6">

            {/* ── LEFT PANEL ── */}
            <div className="flex flex-col gap-6 w-full max-w-md flex-shrink-0">

                {/* Top bar */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800">SmartReply</h1>

                    {/* WS status dot */}
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
                            {wsConnected ? 'Connected' : 'Offline'}
                        </span>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button onClick={() => setShowRequests(!showRequests)} className="text-2xl relative">
                                🔔
                                {pendingRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white
                                    text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </button>

                            {showRequests && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl
                                shadow-xl border border-gray-100 z-10 p-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Friend Requests</h3>
                                    {pendingRequests.length === 0 ? (
                                        <p className="text-xs text-gray-400">No pending requests</p>
                                    ) : (
                                        pendingRequests.map((req) => (
                                            <div key={req.request_id} className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-gray-700">{req.from}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAccept(req.request_id)}
                                                        className="text-xs bg-black text-white px-2 py-1 rounded-lg hover:bg-gray-800">
                                                        Accept
                                                    </button>
                                                    <button onClick={() => handleReject(req.request_id)}
                                                        className="text-xs border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-50">
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {msg && <p className="text-sm text-green-600">{msg}</p>}

                {/* Search */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200">
                    <h2 className="text-sm font-medium text-gray-600 mb-3">Search Users</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300
                            focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black bg-white/80"
                        />
                        <button onClick={handleSearch}
                            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-all">
                            Search
                        </button>
                    </div>
                    <div className="mt-4 space-y-2">
                        {searchResults.map((user) => (
                            <div key={user.username}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{user.username}</p>
                                    <p className="text-xs text-gray-400">{user.emailid}</p>
                                </div>
                                <button onClick={() => handleSendRequest(user.username)}
                                    className="text-xs bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-all">
                                    Add +
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Friends List */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-gray-600">My Friends</h2>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {friends.length}
                        </span>
                    </div>
                    {friends.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">
                            No friends yet — search and add someone!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {friends.map((friend, idx) => {
                                const name = getFriendName(friend);
                                const isActive = activeFriendName === name;
                                const unread = (messages[name] || []).filter(m => m.from === 'them').length;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveFriend(friend)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                                            ${isActive
                                                ? 'bg-black text-white border-black'
                                                : 'bg-gray-50 border-gray-100 hover:border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                                            text-sm font-medium shrink-0
                                            ${isActive ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <p className={`text-sm font-medium flex-1 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                            {name}
                                        </p>
                                        {unread > 0 && !isActive && (
                                            <span className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                                                {unread}
                                            </span>
                                        )}
                                        <span className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                                            💬
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── RIGHT PANEL: CHAT WINDOW ── */}
            <div className="flex-1 flex flex-col min-h-[calc(100vh-3rem)]">
                {activeFriend ? (
                    <div className="flex flex-col h-full bg-white/70 backdrop-blur-lg
                        rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white/80">
                            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center
                                justify-center text-sm font-semibold shrink-0">
                                {activeFriendName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">{activeFriendName}</p>
                                <p className="text-xs text-gray-400">
                                    {wsConnected ? '● Online' : '○ Offline'}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveFriend(null)}
                                className="text-gray-400 hover:text-gray-700 text-lg leading-none"
                                title="Close chat"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-white/40 to-gray-50/60">
                            {activeMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                                    <span className="text-4xl">💬</span>
                                    <p className="text-sm text-gray-400">
                                        No messages yet. Say hi to <strong>{activeFriendName}</strong>!
                                    </p>
                                </div>
                            ) : (
                                activeMessages.map((m, idx) => (
                                    <div key={idx} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] group`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                                ${m.from === 'me'
                                                    ? 'bg-black text-white rounded-br-sm'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'}`}>
                                                {m.text}
                                            </div>
                                            <p className={`text-[10px] text-gray-400 mt-1
                                                ${m.from === 'me' ? 'text-right' : 'text-left'}`}>
                                                {m.time}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Bar */}
                        <div className="px-4 py-3 border-t border-gray-100 bg-white/80 flex gap-2 items-end">
                            <input
                                type="text"
                                placeholder={`Message ${activeFriendName}...`}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200
                                focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black
                                bg-gray-50 resize-none"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!wsConnected || !chatInput.trim()}
                                className="px-4 py-2.5 bg-black text-white text-sm rounded-xl
                                hover:bg-gray-800 transition-all disabled:opacity-40
                                disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                            >
                                <span>Send</span>
                                <span className="text-base">↑</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Empty state when no chat is open */
                    <div className="flex-1 flex flex-col items-center justify-center gap-4
                        bg-white/40 backdrop-blur-sm rounded-2xl border border-gray-200/60
                        border-dashed text-center px-8">
                        <div className="text-5xl opacity-30">💬</div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">No conversation open</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Click a friend from the list to start chatting
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}