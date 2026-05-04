'use client';
import { useState, useEffect, useRef } from 'react';
import {
    searchUsers,
    sendFriendRequest,
    getPendingRequests,
    respondToFriendRequest
} from '../lib/api';

interface User {
    username: string;
    emailid: string;
}

interface FriendRequest {
    request_id: number;
    from: string;
    created_at: string;
}

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [showRequests, setShowRequests] = useState(false);
    const [msg, setMsg] = useState('');

    const loadPendingRequests = async () => {
        try {
            const data = await getPendingRequests();
            setPendingRequests(data);
        } catch (err) {
            console.error(err);
        }
    };
    // load pending requests on page load
    useEffect(() => {
        loadPendingRequests();
    }, []);


    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const data = await searchUsers(searchQuery);
            setSearchResults(data);
        } catch (err) {
            setSearchResults([]);
            setMsg('No users found');
        }
    };

    const handleSendRequest = async (receiver_username: string) => {
        try {
            await sendFriendRequest(receiver_username);
            setMsg(`Friend request sent to ${receiver_username} ✅`);
        } catch (err) {
            setMsg('Failed to send request');
        }
    };

    const handleAccept = async (request_id: number) => {
        try {
            await respondToFriendRequest(request_id, "accepted");
            setMsg('Friend request accepted ✅');
            loadPendingRequests(); // refresh the list
        } catch (err) {
            setMsg('Failed to accept');
        }
    };

    const handleReject = async (request_id: number) => {
        try {
            await respondToFriendRequest(request_id, "declined");
            setMsg('Friend request rejected');
            loadPendingRequests(); // refresh the list
        } catch (err) {
            setMsg('Failed to reject');
        }
    };

    // const wsRef = useRef<WebSocket | null>(null);  // add this

   
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">

            {/* Top bar */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">SmartReply</h1>

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowRequests(!showRequests)}
                        className="text-2xl relative"
                    >
                        🔔
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                            text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>

                    {/* Dropdown for pending requests */}
                    {showRequests && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl 
                        shadow-xl border border-gray-100 z-10 p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Friend Requests
                            </h3>
                            {pendingRequests.length === 0 ? (
                                <p className="text-xs text-gray-400">No pending requests</p>
                            ) : (
                                pendingRequests.map((req) => (
                                    <div key={req.request_id}
                                        className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-700">{req.from}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(req.request_id)}
                                                className="text-xs bg-black text-white 
                                                px-2 py-1 rounded-lg hover:bg-gray-800"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.request_id)}
                                                className="text-xs border border-gray-300 
                                                px-2 py-1 rounded-lg hover:bg-gray-50"
                                            >
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

            {/* Feedback message */}
            {msg && (
                <p className="text-sm text-green-600 mb-4">{msg}</p>
            )}

            {/* Search */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 
            shadow-xl border border-gray-200 max-w-md">
                <h2 className="text-sm font-medium text-gray-600 mb-3">
                    Search Users
                </h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border 
                        border-gray-300 focus:outline-none focus:ring-2 
                        focus:ring-black/20 focus:border-black bg-white/80"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-black text-white text-sm 
                        rounded-lg hover:bg-gray-900 transition-all"
                    >
                        Search
                    </button>
                </div>

                {/* Search Results */}
                <div className="mt-4 space-y-2">
                    {searchResults.map((user) => (
                        <div key={user.username}
                            className="flex items-center justify-between 
                            p-3 rounded-lg bg-gray-50 border border-gray-100">
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    {user.username}
                                </p>
                                <p className="text-xs text-gray-400">{user.emailid}</p>
                            </div>
                            <button
                                onClick={() => handleSendRequest(user.username)}
                                className="text-xs bg-black text-white px-3 py-1 
                                rounded-lg hover:bg-gray-800 transition-all"
                            >
                                Add +
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}