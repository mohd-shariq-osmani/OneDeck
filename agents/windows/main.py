import asyncio
import json
import logging
import platform
import psutil
import sys
import os
from pathlib import Path
from pydantic import BaseModel
from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

# Add shared to path
sys.path.append(str(Path(__file__).parent.parent))
from shared.discovery import DeviceAdvertiser

try:
    import pynvml
    pynvml.nvmlInit()
    HAS_NVIDIA = True
except Exception as e:
    HAS_NVIDIA = False
    print("NVIDIA NVML not available:", e)

app = FastAPI(title="OneDeck Windows Agent")
advertiser = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("onedeck-windows")

@app.on_event("startup")
async def startup_event():
    import threading
    global advertiser
    advertiser = DeviceAdvertiser(device_type="windows", port=8000)
    threading.Thread(target=advertiser.start, daemon=True).start()

@app.on_event("shutdown")
async def shutdown_event():
    if advertiser:
        advertiser.stop()

def get_system_info():
    uname = platform.uname()
    cpu_name = "Unknown CPU"
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
        cpu_name = winreg.QueryValueEx(key, "ProcessorNameString")[0]
    except Exception:
        pass
    gpu_name = "Unknown GPU"
    if HAS_NVIDIA:
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            gpu_name = pynvml.nvmlDeviceGetName(handle)
            if isinstance(gpu_name, bytes):
                gpu_name = gpu_name.decode('utf-8')
        except Exception:
            pass
    return {
        "os": f"{uname.system} {uname.release}",
        "cpu_name": cpu_name,
        "gpu_name": gpu_name,
        "hostname": uname.node
    }

def get_telemetry():
    cpu_percent = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('C:\\')
    gpu_percent = 0
    vram_used_gb = 0
    vram_total_gb = 0
    gpu_temp = 0
    if HAS_NVIDIA:
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            gpu_percent = util.gpu
            mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
            vram_used_gb = mem_info.used / (1024**3)
            vram_total_gb = mem_info.total / (1024**3)
            gpu_temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        except Exception as e:
            pass
    net_io = psutil.net_io_counters()
    return {
        "cpu": cpu_percent,
        "ram_used": round(mem.used / (1024**3), 1),
        "ram_total": round(mem.total / (1024**3), 1),
        "disk_used": round(disk.used / (1024**3), 1),
        "disk_total": round(disk.total / (1024**3), 1),
        "gpu": gpu_percent,
        "gpu_temp": gpu_temp,
        "vram_used": round(vram_used_gb, 1),
        "vram_total": round(vram_total_gb, 1),
        "net_sent": net_io.bytes_sent,
        "net_recv": net_io.bytes_recv,
    }

@app.get("/api/status")
def status():
    return {"status": "online", "system": get_system_info(), "telemetry": get_telemetry()}

class AppLaunchRequest(BaseModel):
    command: str
    args: str = ""

@app.post("/api/apps/launch")
def launch_app(req: AppLaunchRequest):
    import subprocess
    try:
        if req.args:
            subprocess.Popen([req.command, req.args], shell=True)
        else:
            subprocess.Popen(req.command, shell=True)
        return {"status": "launched"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/system/lock")
def system_lock():
    os.system("rundll32.exe user32.dll,LockWorkStation")
    return {"status": "locked"}

@app.post("/api/system/sleep")
def system_sleep():
    os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
    return {"status": "sleeping"}

@app.post("/api/system/restart")
def system_restart():
    # Only for demonstration, removing /t 0 to avoid actually restarting the dev machine silently
    # os.system("shutdown /r /t 0")
    return {"status": "restarting (mock)"}

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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
