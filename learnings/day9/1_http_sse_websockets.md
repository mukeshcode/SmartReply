# HTTP, SSE and Websockets

## How to automatically fetch recent friend requests?(Without any browser refresh)

1. **Manual Refresh Button** - Hit the pending requests api and re-render the component on a button click. (Acceptable for our use case)
2. **Polling** - Hit the pending requests api every 'n' seconds and rerender the component.(Simple but not efficient)
3. **SSE(Server-Sent Events)** - One way, Only server to client. Server pushes updates to client automatically.
4. **WebSockets** - Full duplex(simulataneously both way, client to server and vice versa) persistent connection between client and server. Best for chat.

## SSE (Server-Sent Events) (Just for information, can directly skip to WebSockets, if required)

SSE is a web standard built on top of plain HTTP
(not a separate protocol like WebSocket) where **only the server can send data to the client** (one way)

### Q. But, why will it even be useful, this server sent events?
Yes, they have their own usecases like **push notifications**, **friend request alerts** - anywhere where the server just needs to inform the client, with no reply needed(from the client) through that same channel.

Example flow:
```
You send a friend request   →  POST /friend-request  →  Server  →  DB entry created
                                                          │
                                           SSE pushes  ──┘
                                                          │
                                                          ▼
                                           Friend gets notified instantly
```
*Note : The actual accept/decline action will still be normal HTTP request - SSE is only the notification channel here*

### Q. How does SSE works under the hood(Optional)
SSE isn't a new protocol. It is plain HTTP.
The trick is : Normally HTTP closes the connection after sending the response. SSE just keeps the response body open and drips data down it over time.

```
Normal HTTP(Server to client flow shown here):
  Send Headers + Body and then CONNECTION CLOSED

SSE(Server to client flow shown here):
  Send Headers first and let data drip down slowly
             → data: hello
                      ... 5 seconds later ...
            data: new notification
                      ... 3 seconds later ...
            data: another one
                      (never closes)
```

*SSE is just a slow HTTP response. This is the reason SSE works everywhere - firewalls and proxies don't block it, unlike websockets which uses a different protocol*

## WebSockets
Q. Is it a protocol? 
=> Yes, just like HTTP. It uses `ws://` or `wss://` (secure, like HTTPS).
It is a protocol in which client and server agree to hold a persistent communication channel between them.

### Lifecycle of Websockets
1. Client sends an HTTP request to server for upgrading to WebSocket.
2. If Server agrees clients request, then a websocket connection is established between them, and HTTP steps aside.

*The topology is always client <-> Server and never client <-> client, Ofcourse, the clients are talking to each other but through the server*

**Important : If there are 10k users in the whatsapp, then there will be 10k websockets handled by the backend server at an instant**

### Doesn't persistent connection(SSE/WebSocket) overload the server?(Imagine having 10k persistent connections to the server)
Yes, they do cost something, but it's manageable.

**The old problem(pre-2010):** Servers used one thread per connection. 10k users = 10k threads = huge RAM usage. This was known as the C10K problem.

**The modern solution:** Async servers (like FastAPI) use an event loop - a single thread that cycles through thousands of connections in microseconds, only acting when a connection actually has data.


*NOTE : When apps like WhatsApp or Discord scale to millions, they solve this by adding Redis Pub/Sub (so multiple servers share connection state)*

### HTTP vs WebSocket vs SSE

```
HTTP
  Client asks → Server replies → Connection closes. Done.

SSE
  Client opens a request and just listens.
  Server keeps the connection open and pushes updates whenever something happens.
  Client cannot send data back through this connection.

WebSocket
  Client connects → connection stays open → both sides can send messages anytime.
```