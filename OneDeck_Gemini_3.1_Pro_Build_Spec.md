# OneDeck --- Gemini 3.1 Pro Build Specification

## Role

You are a senior full-stack engineer, UI/UX designer, Android developer,
Windows developer, macOS developer, and networking engineer.

Build a polished, production-quality application called **OneDeck**.

The goal is to turn an old Samsung Android tablet into a permanent
touchscreen control center for a Windows PC and a Mac Mini on the same
local network.

The tablet should function as:

-   PC hardware monitor
-   Mac Mini/server monitor
-   Stream Deck
-   Application launcher
-   System control panel
-   AI tools dashboard
-   Gaming dashboard
-   Media controller
-   n8n automation controller
-   Custom macro pad

Do not build a generic Stream Deck clone. Build a cohesive, premium
dashboard that feels like a dedicated control console.

------------------------------------------------------------------------

# 1. Core Architecture

Use this architecture:

``` text
                 ┌──────────────────────────────┐
                 │       OLD SAMSUNG TABLET     │
                 │                              │
                 │       OneDeck UI         │
                 │       Android / Web UI       │
                 └──────────────┬───────────────┘
                                │
                         Local Wi-Fi / LAN
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
      ┌───────▼────────┐                 ┌────────▼───────┐
      │   WINDOWS PC   │                 │   MAC MINI M1  │
      │                │                 │                │
      │ Unseen Agent   │                 │ Unseen Agent   │
      │ Stats + Control│                 │ Stats + Control│
      └────────────────┘                 └────────────────┘
                                │
                         Optional n8n
                                │
                         Automation APIs
```

The tablet should not need to know hard-coded IP addresses whenever
possible.

Implement automatic device discovery on the local network using a
suitable LAN discovery mechanism such as mDNS/Bonjour, UDP discovery, or
another robust cross-platform approach.

Each computer should advertise:

-   Device name
-   Device type
-   Operating system
-   IP address
-   Agent port
-   Agent version
-   Capabilities
-   Online/offline status

The tablet discovers both machines automatically.

------------------------------------------------------------------------

# 2. Target Devices

## Windows PC

Current target hardware:

-   AMD Ryzen 5 9600X
-   NVIDIA RTX 4060 Ti 16GB
-   16GB DDR5 RAM
-   480GB SSD
-   Windows 11

The implementation should NOT be hard-coded to this hardware. It should
detect hardware dynamically.

Monitor:

-   CPU utilization
-   CPU temperature
-   CPU frequency
-   RAM usage
-   GPU utilization
-   GPU temperature
-   GPU memory usage
-   GPU power
-   GPU fan speed
-   SSD usage
-   Network upload/download
-   System uptime
-   Running applications
-   Active game/process where possible

For NVIDIA GPUs, use an appropriate Windows-compatible method such as
NVML/NVIDIA tooling.

For CPU/GPU temperatures, use reliable hardware monitoring
libraries/APIs rather than inventing values.

------------------------------------------------------------------------

## Mac Mini

Target machine:

-   Apple M1
-   16GB unified memory

Monitor:

-   CPU utilization
-   Memory pressure/usage
-   Disk usage
-   Network upload/download
-   System uptime
-   Running applications
-   Docker containers
-   Services
-   Temperature where reliably available

The Mac agent should support shell commands and application launching
through safe controlled APIs.

------------------------------------------------------------------------

# 3. Tablet UI

The UI should closely follow this design philosophy:

-   Dark black background
-   Premium modern dashboard
-   Purple as primary accent
-   Blue/cyan secondary accents
-   Subtle gradients
-   Rounded cards
-   Soft glow
-   Minimal borders
-   Large touch targets
-   High contrast
-   Tablet landscape orientation
-   Information-dense but not cluttered
-   Smooth animations
-   Responsive layout
-   Designed for a permanently mounted tablet

Do NOT make it look like a website stretched onto a tablet.

It should feel like a dedicated hardware control surface.

------------------------------------------------------------------------

# 4. Main Navigation

Use a left-side navigation rail in landscape mode.

Navigation:

``` text
ONEDECK

Overview
PC Control
Mac Mini
AI Studio
Gaming
Automations
Media
Tools
Settings
```

At the bottom:

``` text
Connected user/device
Add Device
```

The navigation should remain visible on the main tablet layout.

On very small screens, collapse it into an icon rail.

------------------------------------------------------------------------

# 5. Home / Overview Screen

Create a dashboard similar to the following:

``` text
┌──────────────────────────────────────────────────────────────┐
│ ONEDECK     02:39 AM       Network       Weather       │
├───────────────┬───────────────────────────────┬──────────────┤
│               │                               │ QUICK LAUNCH │
│   NAVIGATION  │       WINDOWS PC              │              │
│               │       CPU / GPU / RAM         │ Chrome       │
│ Overview      │                               │ Discord      │
│ PC Control    │       MAC MINI M1             │ Spotify      │
│ Mac Mini      │       CPU / RAM / Storage     │ Steam        │
│ AI Studio     │                               │ VS Code      │
│ Gaming        │                               │ LM Studio    │
│ Automations   │       GAMING                  │ ComfyUI      │
│ Media         │       AI STUDIO               │ n8n          │
│ Tools         │                               │ Power BI     │
│ Settings      │                               │              │
│               │                               │              │
├───────────────┴───────────────────────────────┴──────────────┤
│                MEDIA PLAYER / CONTROLS                       │
└──────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 6. Windows PC Card

Show:

``` text
WINDOWS PC                    ● Online

Windows 11
Ryzen 5 9600X
RTX 4060 Ti 16GB

CPU       42%     56°C
GPU       67%     57°C
RAM       11.2/16 GB
VRAM      6.3/16 GB

SSD       296/480 GB
Network   ↑ 42.6 Mbps
          ↓ 18.7 Mbps

Fan       1200 RPM
Uptime    5d 14h
```

Include tiny real-time graphs for:

-   CPU
-   GPU
-   Network

Graphs should update without excessive network traffic.

Allow the user to tap the card to open the complete PC dashboard.

------------------------------------------------------------------------

# 7. Mac Mini Card

Show:

``` text
MAC MINI M1                  ● Online

macOS
Apple M1
16GB Unified Memory

CPU       18%     50°C
RAM       8.2/16 GB
Storage   1.4/2 TB

Network   ↑ 12.4 Mbps
          ↓ 8.3 Mbps

Uptime    5d 14h
Services  5 Running
```

Tap to open the Mac Mini dashboard.

------------------------------------------------------------------------

# 8. Quick Launch

Create a grid of large touch buttons.

Default applications:

-   Chrome
-   Discord
-   Spotify
-   Steam
-   VS Code
-   LM Studio
-   ComfyUI
-   n8n
-   Power BI
-   File Explorer
-   QuickBooks
-   Notion
-   Telegram
-   Obsidian
-   Recycle Bin

The user must be able to customize these.

Each launcher should contain:

-   Icon
-   Name
-   Target device
-   Application path/command
-   Optional arguments
-   Optional working directory

Example:

``` json
{
  "name": "LM Studio",
  "device": "windows",
  "command": "C:\\Program Files\\LM Studio\\LM Studio.exe"
}
```

Do not assume this exact path exists. Provide a UI for
selecting/configuring the application.

------------------------------------------------------------------------

# 9. System Controls

Create large buttons for:

``` text
Lock PC
Sleep
Restart
Shutdown

Volume -
Mute
Volume +

Mic Mute

Screenshot
Clipboard
Clear Temp
Turn Off Monitor
```

Dangerous actions such as Shutdown and Restart must require
confirmation.

Do not expose unrestricted arbitrary remote shell execution from the
tablet.

Use an allowlisted command/action system.

------------------------------------------------------------------------

# 10. Gaming Dashboard

Create a dedicated Gaming screen.

Example:

``` text
GAMING

Cyberpunk 2077                  ● Running

FPS             82
GPU             98%
CPU             64%
VRAM            13.1 / 16 GB
RAM             12.4 / 16 GB
GPU Temperature 67°C

[ Game Dashboard ]
[ Capture Screenshot ]

[ Discord ]
[ Spotify ]
[ Mute Mic ]
[ Volume ]
[ OBS ]
```

Detect the currently active game/process where possible.

Make the gaming screen optimized for quick taps.

------------------------------------------------------------------------

# 11. AI Studio

Create an AI control page.

## LM Studio

Display:

-   Server status
-   Loaded model
-   Tokens/sec
-   GPU utilization
-   VRAM usage
-   Context information where available

Controls:

``` text
Open LM Studio
Start Server
Stop Server
Restart Server
```

## ComfyUI

Display:

-   Running/idle
-   Queue count where available
-   GPU usage
-   VRAM

Controls:

``` text
Start ComfyUI
Stop ComfyUI
Open ComfyUI
Clear Queue
```

Design this area so additional AI tools can be added later.

------------------------------------------------------------------------

# 12. Mac Mini Server Dashboard

The Mac Mini is also a server.

Create a section:

``` text
SERVER — MAC MINI

Pi-hole       ● Running      [Open]
Jellyfin      ● Running      [Open]
Plex          ● Running      [Open]
Nextcloud     ● Running      [Open]
Tailscale     ● Connected    [Open]
n8n           ● Running      [Open]
```

If Docker is installed, retrieve container status.

Show:

-   Running
-   Stopped
-   Restarting
-   Unhealthy
-   Unknown

Allow:

``` text
Start
Stop
Restart
Open
```

for configured services.

------------------------------------------------------------------------

# 13. Automations

Create an Automations page.

Allow buttons to trigger n8n webhooks.

Examples:

``` text
Run Daily Backup
Restart n8n
Start Media Server
Process PDFs
Start AI Services
Run QuickBooks Workflow
Backup Mac Mini
```

The user should be able to configure:

-   Name
-   Icon
-   Color/accent
-   n8n webhook URL
-   HTTP method
-   Optional authentication
-   Confirmation requirement

Never expose webhook secrets directly in the visible UI.

Store credentials securely.

------------------------------------------------------------------------

# 14. Media Control

Create a media bar permanently visible at the bottom.

Show:

-   Album art
-   Track name
-   Artist
-   Play/pause
-   Previous
-   Next
-   Progress
-   Volume
-   Current media application

Support where practical:

-   Spotify
-   VLC
-   Plex
-   Jellyfin
-   Browser media

Use platform APIs where available.

------------------------------------------------------------------------

# 15. Device Management

Create an Add Device screen.

Automatically discovered devices should appear.

Example:

``` text
DEVICES

Windows PC
● Online
Windows 11
192.168.1.xxx

[Connect]

Mac Mini
● Online
macOS
192.168.1.xxx

[Connect]
```

Allow manual device addition as a fallback.

For first-time pairing, require a pairing code displayed on the
computer.

Example:

``` text
ONEDECK PAIRING

Tablet is requesting access.

Code:
  482 731

[Allow]   [Reject]
```

Never silently grant remote control.

------------------------------------------------------------------------

# 16. Security

Security is extremely important.

The system is designed primarily for a trusted local network, but it
must still be secured.

Implement:

-   Device pairing
-   Authentication
-   Per-device authorization
-   Secure local communication where practical
-   No unauthenticated arbitrary command execution
-   Allowlisted actions
-   Confirmation for dangerous actions
-   Configurable permissions
-   Session/token expiry
-   Basic rate limiting
-   Request validation
-   Audit log for sensitive commands

Never expose the agent directly to the public internet.

------------------------------------------------------------------------

# 17. Communication API

Create a clean API between the tablet and agents.

Example endpoints:

``` text
GET  /api/status
GET  /api/stats
GET  /api/apps
POST /api/apps/launch

POST /api/system/lock
POST /api/system/sleep
POST /api/system/restart
POST /api/system/shutdown

POST /api/media/play
POST /api/media/pause
POST /api/media/next
POST /api/media/previous

GET  /api/services
POST /api/services/start
POST /api/services/stop
POST /api/services/restart

POST /api/automation/trigger
```

Use WebSockets or Server-Sent Events for real-time statistics instead of
polling every metric aggressively.

The dashboard should remain responsive even if one machine goes offline.

------------------------------------------------------------------------

# 18. Offline Handling

If Windows goes offline:

``` text
WINDOWS PC
● Offline

Last seen:
02:37 AM
```

The Mac dashboard should continue working.

If Mac goes offline, Windows controls should continue working.

Never freeze the entire interface because one device is unreachable.

------------------------------------------------------------------------

# 19. Tablet Optimization

The Samsung tablet may be very old.

Therefore:

-   Keep CPU usage low
-   Avoid heavy animations
-   Avoid huge JavaScript bundles
-   Avoid unnecessary background work
-   Limit graph refresh rates
-   Use GPU-friendly CSS
-   Cache static assets
-   Support low-memory devices
-   Support older Android WebView versions where practical
-   Provide a low-performance mode
-   Prevent screen sleep while the dashboard is active
-   Support fullscreen/kiosk mode
-   Prefer landscape orientation

The application should be usable as a permanent always-on display.

------------------------------------------------------------------------

# 20. Theme

Default theme:

``` text
Background: near-black
Cards: dark charcoal
Primary: purple
Secondary: cyan/blue
Success: green
Warning: amber
Danger: red
Text: white/light gray
```

Do not overuse glow effects.

The UI should look premium rather than like a gaming RGB dashboard.

Add subtle animated graphs and status indicators.

------------------------------------------------------------------------

# 21. Customization

The user must be able to customize:

-   Device names
-   Quick-launch applications
-   Button order
-   Button icons
-   Button labels
-   Pages
-   Automations
-   Server services
-   Media controls
-   Dashboard cards
-   Refresh intervals
-   Theme/accent
-   Tablet layout

Support drag-and-drop customization if practical.

------------------------------------------------------------------------

# 22. Settings

Create:

``` text
Settings

Devices
Appearance
Quick Launch
Automations
Media
Monitoring
Security
Performance
About
```

Monitoring settings:

``` text
Stats refresh:
1 sec
2 sec
5 sec
10 sec

Graph history:
30 sec
1 min
5 min
15 min
```

Performance:

``` text
Low Performance Mode
Reduce animations
Reduce graph refresh
Keep screen awake
Fullscreen mode
Kiosk mode
```

------------------------------------------------------------------------

# 23. Architecture Recommendation

Choose technologies based on reliability and ease of deployment.

A strong implementation would be:

### Tablet

Android application or lightweight PWA/WebView-based application.

Prefer a solution that works well on old Samsung tablets.

### Windows Agent

Lightweight background service/application.

Possible technologies:

-   Python + FastAPI
-   .NET
-   Rust
-   Node.js

Choose the option that provides the most reliable hardware monitoring
and easiest Windows deployment.

### macOS Agent

Use a lightweight local agent.

Possible technologies:

-   Python
-   Swift
-   Node.js
-   Rust

Choose the option that gives reliable macOS system access.

### Shared protocol

Use JSON REST + WebSocket/SSE.

Keep the protocol platform-independent.

------------------------------------------------------------------------

# 24. Project Structure

Organize the project cleanly.

Suggested structure:

``` text
onedeck/
│
├── tablet/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── themes/
│   └── assets/
│
├── agents/
│   ├── windows/
│   ├── macos/
│   └── shared/
│
├── protocol/
│   ├── api/
│   ├── schemas/
│   └── discovery/
│
├── docs/
│
└── README.md
```

Adapt this structure to the chosen framework if necessary.

------------------------------------------------------------------------

# 25. Important Development Rules

Do not create a fake demo.

Build real functionality.

If a feature cannot be implemented reliably on a particular operating
system, clearly isolate it behind a capability check and display:

``` text
Not supported
```

rather than showing fake data.

Do not hard-code fake CPU/GPU statistics.

Do not hard-code fake service statuses.

Do not hard-code fake online/offline states.

Use real system APIs.

Build the application incrementally.

First make:

1.  Tablet UI
2.  Windows agent
3.  Mac agent
4.  Device discovery
5.  Pairing
6.  Real hardware stats
7.  Application launching
8.  System controls
9.  Server controls
10. n8n integration
11. Media controls
12. Customization
13. Security hardening
14. Packaging/installers

------------------------------------------------------------------------

# 26. First Milestone

Before implementing every feature, create a working vertical slice.

It must demonstrate:

``` text
Tablet
   ↓
Discovers Windows PC
   ↓
Pairs with Windows PC
   ↓
Receives real CPU/GPU/RAM data
   ↓
Displays it on dashboard
   ↓
Launches Chrome
   ↓
Changes Windows volume
```

Then add:

``` text
Tablet
   ↓
Discovers Mac Mini
   ↓
Pairs with Mac Mini
   ↓
Receives real Mac stats
   ↓
Displays server services
   ↓
Opens Jellyfin
```

Only after these work should the rest of the dashboard be implemented.

------------------------------------------------------------------------

# 27. UI Quality Requirements

The UI is extremely important.

Match the following characteristics:

-   Professional
-   Minimal
-   Premium
-   Dark
-   Modern
-   Responsive
-   Touch-first
-   High information density
-   Excellent typography
-   Consistent spacing
-   Consistent icons
-   Smooth but restrained animations

Avoid:

-   Generic Bootstrap appearance
-   Huge empty spaces
-   Excessive gradients
-   Excessive RGB
-   Tiny buttons
-   Tiny text
-   Desktop-only interaction patterns
-   Fake dashboard widgets
-   Excessive glassmorphism

Every button should be comfortable to tap on a tablet.

------------------------------------------------------------------------

# 28. Final Dashboard Layout

The main screen should approximately follow this composition:

``` text
┌─────────────────────────────────────────────────────────────────────┐
│ ONEDECK       02:39 AM        NETWORK        WEATHER      ⚙   │
├──────────────┬──────────────────────────────────────┬───────────────┤
│              │                                      │ QUICK LAUNCH  │
│  OVERVIEW    │       WINDOWS PC                     │               │
│              │       CPU   GPU   RAM   VRAM         │ Chrome        │
│  PC CONTROL  │                                      │ Discord       │
│              │       MAC MINI M1                    │ Spotify       │
│  MAC MINI    │       CPU   RAM   SSD                │ Steam         │
│              │                                      │ VS Code       │
│  AI STUDIO   │       GAMING                         │ LM Studio     │
│              │                                      │ ComfyUI       │
│  GAMING      │       AI STUDIO                     │ n8n           │
│              │                                      │ Power BI      │
│  AUTOMATIONS │                                      │ File Explorer │
│              │                                      │               │
│  MEDIA       ├──────────────────────┬───────────────┤ SYSTEM        │
│              │ GAMING               │ AI STUDIO     │ CONTROLS      │
│  TOOLS       │                      │               │               │
│              │ FPS / GPU / VRAM     │ LM Studio     │ Lock          │
│  SETTINGS    │                      │ ComfyUI       │ Sleep         │
│              │ [Controls]           │ [Controls]    │ Restart       │
│              │                      │               │ Shutdown      │
│              ├──────────────────────┴───────────────┤               │
│              │ SERVER — MAC MINI                    │ Volume        │
│              │ Pi-hole • Jellyfin • Plex • n8n      │ Mute          │
│              └──────────────────────────────────────┴───────────────┤
│                         MEDIA PLAYER                               │
└─────────────────────────────────────────────────────────────────────┘
```

Use the generated UI concept as visual inspiration, but improve the
implementation wherever appropriate.

------------------------------------------------------------------------

# 29. Deliverables

Produce:

1.  Complete source code
2.  Android/tablet application
3.  Windows agent
4.  macOS agent
5.  Shared API/protocol
6.  Device discovery
7.  Pairing system
8.  Configuration system
9.  Setup documentation
10. Windows installer
11. macOS installation instructions/package
12. Android APK/build instructions
13. Troubleshooting guide
14. Security documentation

The README must explain how to:

-   Install the Windows agent
-   Install the Mac agent
-   Install the tablet app
-   Pair devices
-   Configure applications
-   Configure n8n
-   Configure server services
-   Troubleshoot network discovery
-   Enable kiosk mode
-   Update the system

------------------------------------------------------------------------

# 30. Final Instruction

Build this as a real application, not a mockup.

Prioritize the working end-to-end architecture first.

Do not stop at designing screens.

Do not use placeholder telemetry when real telemetry is available.

Do not assume the tablet is powerful.

Do not assume Windows and macOS have identical capabilities.

Use capability detection.

Keep the system modular so additional devices can be added later.

The final result should make an old Samsung tablet feel like a dedicated
professional control panel sitting beside the user's PC.
