from fastapi import FastAPI
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import os
import subprocess
import signal
import asyncio
import threading
from queue import Queue, Empty
import sys

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

class BotStatus(BaseModel):
    status: str
    prefix: str
    logs: list[str]

node_process = None
node_process_pid = None

log_queue = Queue()
log_store = []  # persistent log memory (in RAM)

def is_process_running(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    return True

@app.get("/status", response_model=BotStatus)
def get_status():
    global node_process_pid
    status = "Running" if node_process_pid and is_process_running(node_process_pid) else "Offline"
    logs = log_store[-300:] if status == "Running" else []  # clear logs when offline
    return BotStatus(status=status, prefix="!", logs=logs)

@app.post("/run")
def run_bot():
    global node_process, node_process_pid

    if node_process and is_process_running(node_process_pid):
        return {"message": "Bot is already running", "pid": node_process_pid}

    os.system("clear")
    process = subprocess.Popen(
        ["npx", "tsx", "../src/index.ts"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        start_new_session=True,
    )
    node_process = process
    node_process_pid = process.pid

    def enqueue_output(stream):
        for line in iter(stream.readline, ''):
            formatted = f"> {line.rstrip()}"
            log_queue.put(formatted)
            log_store.append(formatted)
        stream.close()

    threading.Thread(target=enqueue_output, args=(process.stdout,), daemon=True).start()
    threading.Thread(target=enqueue_output, args=(process.stderr,), daemon=True).start()

    return {"message": "Bot started", "pid": node_process_pid}

@app.post("/quit-node")
def quit_node():
    global node_process_pid, node_process
    if node_process_pid and is_process_running(node_process_pid):
        try:
            os.killpg(os.getpgid(node_process_pid), signal.SIGKILL)
        except ProcessLookupError:
            pass
    node_process_pid = None
    node_process = None
    return {"message": "Node.js instance terminated"}

@app.get("/logs")
def stream_logs():
    async def event_generator():
        while True:
            try:
                line = log_queue.get_nowait()
                yield f"data: {line}\n\n"
            except Empty:
                await asyncio.sleep(0.5)
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/", response_class=HTMLResponse)
def dashboard():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Lyric Bot Dashboard</title>
        <link rel="stylesheet" type="text/css" href="/static/styles.css">
    </head>
    <body>
        <div class="container">
            <div id="status">Bot Status: Offline</div><br/>
            <button onClick="run()">Run Bot</button>
            <button onClick="quitNode()">Quit Node</button>
            <pre id="terminal"></pre>
        </div>

        <script>
            function updateStatusAndLogs() {
                fetch('/status')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('status').innerText = "Bot Status: " + data.status;
                        const terminal = document.getElementById("terminal");

                        if (data.status === "Offline") {
                            terminal.textContent = "";  // clear terminal if bot is offline
                        } else {
                            terminal.textContent = data.logs.join("\\n");
                            terminal.scrollTop = terminal.scrollHeight;
                        }
                    });
            }

            function run() {
                fetch('/run', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        updateStatusAndLogs();
                    });
            }

            function quitNode() {
                fetch('/quit-node', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        updateStatusAndLogs();
                    });
            }

            function startLogStream() {
                const terminal = document.getElementById("terminal");
                const evtSource = new EventSource("/logs");
                evtSource.onmessage = function(e) {
                    terminal.textContent += e.data + "\\n";
                    terminal.scrollTop = terminal.scrollHeight;
                };
            }

            updateStatusAndLogs();
            startLogStream();
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content.strip())


uvicorn.run(app, host=sys.argv[1], port=8000)
