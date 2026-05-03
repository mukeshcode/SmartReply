Requirement: A user logs in, and should be able to search a particular username and send a friend request.
Now, how will the respective user know, that he has received the request?

Very very naive solution
1. Create a request table/model(from, to, status) in PostgresQL db.
2. So, if I am already logged in, I would continuosly hit the fetch_request table to get any request that is assigned to me. for e.g. every 5 sec, I would hit the API.
But, it is very very inefficient.

Solution(WebSockets(friend requests, notifications, typing indicators, read receipts))
As the user logs in, then open a persistent websocket connection to your backend. Now your server can push events to them instantly, whether it's a chat message or a friend request.


Normal HTTP works like this : 
Client asks -> Server replies -> Connection closes. Done.

WebSockets
Client connects -> Connection stays open -> Both sides can send messages anytime until one of them closes it.
Literal meaning -> Think of it like an electrical socket in your wall — it's a fixed point where two things plug into each other and stay connected.

Is WebSocket also a protocol? 
Yes, it is, just like HTTP. Written as (ws:// or wss:// for secure, just like HTTPS)
But, interestingly! A websocket connection doesn't begin from scratch, it starts with an HTTP Request, and then the two sides agree to upgrade their connection to ws

Client : Hey, I am connecting via HTTP... but can we switch to WebSocket and keep this line open?
Server : Sure, Upgrading now

After that handshake, HTTP steps aside and WebSocket takes over. The connection is now persistent and full-duplex.

This is how we connect in websockets

client1 <-> server, client2 <-> server and not client1 <-> client2