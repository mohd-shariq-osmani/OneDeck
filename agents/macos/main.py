import asyncio
import json
import logging
import platform
import psutil
import sys
import os
import subprocess
from pathlib import Path
from pydantic import BaseModel
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

# Add shared to path
sys.path.append(str(Path(__file__).parent.parent))
from shared.discovery import DeviceAdvertiser

app = FastAPI(title="OneDeck macOS Agent")
advertiser = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("onedeck-macos")

@app.on_event("startup")
async def startup_event():
    import threading
    global advertiser
    advertiser = DeviceAdvertiser(device_type="macos", port=8001)
    threading.Thread(target=advertiser.start, daemon=True).start()

@app.on_event("shutdown")
async def shutdown_event():
    if advertiser:
        advertiser.stop()

def get_system_info():
    uname = platform.uname()
    # Mocking Apple Silicon specs for this simulation
    return {
        "os": f"macOS {uname.release}",
        "cpu_name": "Apple M1",
        "gpu_name": "Apple M1 GPU",
        "hostname": uname.node + "-MacMini"
    }

def get_telemetry():
    cpu_percent = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/') # macOS root
    
    net_io = psutil.net_io_counters()
    return {
        "cpu": cpu_percent,
        "ram_used": round(mem.used / (1024**3), 1),
        "ram_total": round(mem.total / (1024**3), 1),
        "disk_used": round(disk.used / (1024**3), 1),
        "disk_total": round(disk.total / (1024**3), 1),
        "net_sent": net_io.bytes_sent,
        "net_recv": net_io.bytes_recv,
    }

def get_docker_services():
    """Mock or actual docker ps command"""
    try:
        # Assuming docker CLI is available, else mock it
        result = subprocess.run(["docker", "ps", "--format", "{{.Names}}|{{.State}}"], capture_output=True, text=True, timeout=2)
        if result.returncode == 0:
            services = []
            for line in result.stdout.splitlines():
                parts = line.split('|')
                if len(parts) == 2:
                    services.append({"name": parts[0], "status": parts[1]})
            return services
    except Exception:
        pass
    
    # Mock data if docker isn't running
    return [
        {"name": "pihole", "status": "running"},
        {"name": "jellyfin", "status": "running"},
        {"name": "nextcloud", "status": "stopped"}
    ]

@app.get("/api/status")
def status():
    return {"status": "online", "system": get_system_info(), "telemetry": get_telemetry()}

@app.get("/api/services")
def services():
    return {"services": get_docker_services()}

@app.post("/api/services/{service}/start")
def start_service(service: str):
    subprocess.Popen(["docker", "start", service])
    return {"status": "starting"}

@app.post("/api/services/{service}/stop")
def stop_service(service: str):
    subprocess.Popen(["docker", "stop", service])
    return {"status": "stopping"}

class AppLaunchRequest(BaseModel):
    command: str

@app.post("/api/apps/launch")
def launch_app(req: AppLaunchRequest):
    try:
        # In actual macOS: subprocess.Popen(["open", "-a", req.command])
        # We mock it for cross-platform simulation
        print(f"Mock launching: {req.command}")
        return {"status": "launched"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/system/sleep")
def system_sleep():
    # macOS: os.system("pmset sleepnow")
    return {"status": "sleeping (mock)"}

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    psutil.cpu_percent(interval=None)
    prev_net = psutil.net_io_counters()
    try:
        while True:
            await asyncio.sleep(1.0)
            telemetry = get_telemetry()
            curr_net = psutil.net_io_counters()
            sent_mbps = ((curr_net.bytes_sent - prev_net.bytes_sent) * 8) / 1_000_000
            recv_mbps = ((curr_net.bytes_recv - prev_net.bytes_recv) * 8) / 1_000_000
            prev_net = curr_net
            telemetry['net_upload_mbps'] = round(sent_mbps, 2)
            telemetry['net_download_mbps'] = round(recv_mbps, 2)
            await websocket.send_json(telemetry)
    except Exception as e:
        logger.info(f"WebSocket disconnected")

if __name__ == "__main__":
    import uvicorn
    psutil.cpu_percent(interval=None)
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
