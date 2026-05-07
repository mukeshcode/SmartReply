# Creating simple websockets(from https://fastapi.tiangolo.com/advanced/websockets)

```bash
pip install websockets  #if using pip
uv add websockets # if using uv
```

```python
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var ws = new WebSocket("ws://localhost:8000/banana_ws");
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@app.get("/")
async def get():
    return HTMLResponse(html)


@app.websocket("/banana_ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try : 
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        print("Client disconnected") # clean up here

```

```bash
Run with
uvicorn file_name:app --reload
```

## Frontend
1. Defines a form with onsubmit=custom_function(event)
2. var ws = new WebSocket("ws://localhost:8000/banana_ws");
    Creates a new WebSocket object(WebSocket class is provided by browser) passing the ws endpoint.
3. Two important functions provided by this object : 
    a. ws.onmessage = This defines what will happen, when the browser/user receives a message from the server. In the given e.g. it is appending the received msg as list item.
    b. ws.send('your_msg_here') = This defines what will be sent to the server from your browser.
4. So, the crux is we have a form, whose submit button sends data to the server through websocket. It displays the received data from the server through websocket in the list.


## Backend
1. @app.get('/') -> Returns the above HTML response itself which gets rendered in the browser.
2. from fastapi import WebSocket(import the WebSocket class provided by fastapi)
3. @app.websocket('/banana_ws') Name the endpoint anything, mostly 'ws' is used
4. async def websocket_endpoint(websocket : WebSocket) : 
    the websocket in the function definition is the actual websocket connection(obj) between browser and the server.
    *Focus : we never passed websocket in the query parameters(as we used to do in HTTP requests). So, where does the parameter came from?*
    **FastAPI automatically injects the WebSocket connection object when a client connects. It contains metadata like client address and connection state.**
5. websocket.accept() -> this sends the server's agreement to upgrade
from HTTP to WebSocket. Until this is called, the connection is not
yet established — the client is still waiting.

6. Some important function : websocket.accept(), websocket.close() {closes a ws connection}

7. while True : 
    data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")

    This infinite loop is the actual persistent connection.
    receive_text() function waits for the browser/user to send any text request.
    *websocket.send_text("Hi there!") : This will send the msg back to the same connection from where the request came from(for this naive example)*

8. *Important : If the client disconnects (closes tab, loses internet),
`receive_text()` raises a `WebSocketDisconnect` exception.
Always catch it, otherwise our server will crash on every disconnection.*
    

### But how to enable chatting using this?
1. I logged in and hit the 'ws' endpoint, which assigned a ws connection to me at the server.
2. Another user also logged in, and hit the 'ws' endpoint, which assigned a ws connection to them at the server.
3. **But, how will they communicate to each other?**
4. I sent this message to the server ws.send(JSON.stringify({
    sender: "user1",
    receiver: "user2",
    message: "hello"
}))
5. Can I use this receiver_user_id to push this msg to the particular user? (By using websocket.send_text(msg))
6. **NO** : Why? Because everyone's websocket object is different. I cannot use my websocket object to send to someone else. If I do websocket.send_message, then this is my websocket object, it will send message to me only.
**A WebSocket object can only send messages to the connection it represents. To send to others, you must hold their WebSocket objects.**


What is the solution?
{
    user_1 : user1_websocket_obj,
    user_2 : user2_websocket_obj,
    user_3 : user3_websocket_obj,
    ...
}

So, store all the websocket objects against their user_id, retrieve the websocket obj using the receiver_user_id and send text_message over that websocket.

We will create ConnectionManager for this. !!