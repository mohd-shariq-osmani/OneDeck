# OneDeck

OneDeck is a premium, open-source dashboard that unites telemetry and control for both your Windows PC and Mac Mini in a single cohesive control panel.

Built with performance and aesthetics in mind, OneDeck seamlessly bridges real-time system stats (CPU, GPU, RAM, Network) across operating systems using an automated mDNS discovery network.

![OneDeck Dashboard Interface](https://upload.wikimedia.org/wikipedia/commons/e/e8/Windows_11_logo.svg) <!-- Replace with an actual screenshot of the dashboard if needed -->

## Architecture

OneDeck uses a distributed architecture to securely gather live data and expose system controls without the overhead of heavy desktop applications.

- **Frontend (Tablet/Browser)**: A React-based web dashboard (Vite + TypeScript + Lucide Icons). Connects to agents via WebSocket for sub-second live updates.
- **Windows Agent**: A lightweight Python (FastAPI) backend. Monitors GPU (NVML), CPU, fans, and network speeds, and allows remote system controls (Lock, Sleep, Reboot) and fast application launching.
- **macOS Agent**: A specialized Python (FastAPI) backend tailored for Apple Silicon. Exposes Docker service health checks to monitor local homelab servers (e.g. Pi-hole, Plex, Nextcloud) and macOS resource usage.

All components discover each other automatically on your local network using `zeroconf` (mDNS), eliminating manual IP configurations.

## Setup Instructions

### 1. Starting the Windows Agent

The Windows agent requires Python 3.10+ and a local virtual environment.

```bash
cd agents/windows
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Run the agent (default port 8000)
python main.py
```

### 2. Starting the macOS Agent

If you are running the macOS agent on your Mac Mini, follow the same procedure:

```bash
cd agents/macos
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the agent (default port 8001)
python main.py
```

*Note: The Mac agent will track Docker services. Ensure Docker Desktop or Docker Engine is running and accessible to the user running the agent.*

### 3. Running the Dashboard (Frontend)

The dashboard is a modern React application. You need Node.js and `npm` installed.

```bash
cd tablet
npm install

# Start the development server and expose it to your network
npm run dev -- --host
```

Once the Vite server is running, open your web browser (or point your tablet) to the IP address printed in the terminal (e.g., `http://192.168.0.x:5173`).

The dashboard will automatically connect to both your Windows and macOS agents via WebSockets.

## Roadmap & Customization

The dashboard is currently designed with a dark, glassmorphism-inspired theme. Customization options for theming, quick launch applications, and automation bindings are configured in `App.tsx` and your backend Python scripts.

Enjoy your unified setup!
