import React, { useEffect, useState } from 'react';
import {
  Home, Monitor, Apple, Cpu, Gamepad2, Settings, Play, PlayCircle, Settings2, SkipBack, SkipForward,
  Power, Volume2, VolumeX, Lock, Moon, Mic, MicOff, Camera, Clipboard, Trash, MonitorOff, Activity,
  Globe, Cloud, Moon as MoonIcon, Search, Bell, Edit2, Clock, User, PlusCircle, Volume1, Pause
} from 'lucide-react';
import './index.css';
import './App.css';

// --- MOCK DATA FOR UI PREVIEW ---
const pcSys = { os: 'Windows 11 Pro', cpu_name: 'Ryzen 5 9600X', gpu_name: 'RTX 4060 Ti 16GB' };
const pcTelemetry = {
  cpu: 42, cpu_temp: 56, gpu: 67, gpu_temp: 57,
  ram_used: 11.2, ram_total: 16, vram_used: 6.3, vram_total: 16,
  disk_used: 296, disk_total: 480, net_upload_mbps: 42.6, net_download_mbps: 18.7,
  fan_speed: 1200
};

const macSys = { os: 'macOS Sonoma 14.5', cpu_name: 'Apple M1', ram: '16 GB Unified Memory' };
const macTelemetry = {
  cpu: 18, cpu_temp: 50, ram_used: 8.2, ram_total: 16,
  disk_used: 1.4, disk_total: 2.0, net_upload_mbps: 12.4, net_download_mbps: 8.3,
  uptime: '5d 14h 33m'
};

const quickLaunchApps = [
  { name: 'Chrome', icon: '🌐', color: '#4285F4' },
  { name: 'Discord', icon: '💬', color: '#5865F2' },
  { name: 'Spotify', icon: '🎵', color: '#1DB954' },
  { name: 'Steam', icon: '🎮', color: '#171a21' },
  { name: 'VS Code', icon: '💻', color: '#007ACC' },
  { name: 'LM Studio', icon: '🧠', color: '#6A0DAD' },
  { name: 'ComfyUI', icon: '🎨', color: '#FF7F50' },
  { name: 'n8n', icon: '⚙️', color: '#FF6D5A' },
  { name: 'Power BI', icon: '📊', color: '#F2C811' },
  { name: 'File Explorer', icon: '📁', color: '#FCD116' },
  { name: 'QuickBooks', icon: '💼', color: '#2CA01C' },
  { name: 'Notion', icon: '📓', color: '#000000' },
  { name: 'Telegram', icon: '✈️', color: '#26A5E4' },
  { name: 'Obsidian', icon: '💎', color: '#7A3CEF' },
  { name: 'Recycle Bin', icon: '🗑️', color: '#A9A9A9' }
];

const macServices = [
  { name: 'Pi-hole', status: 'Running', color: '#F53039' },
  { name: 'Jellyfin', status: 'Running', color: '#00A4DC' },
  { name: 'Plex', status: 'Running', color: '#E5A00D' },
  { name: 'Nextcloud', status: 'Running', color: '#0082C9' },
  { name: 'Tailscale', status: 'Connected', color: '#000000', isWhiteBg: true }
];

function App() {
  const [activeTab, setActiveTab] = useState('Overview');

  const [pcLive, setPcLive] = useState(pcTelemetry);
  const [macLive, setMacLive] = useState(macTelemetry);
  const [pcOnline, setPcOnline] = useState(false);
  const [macOnline, setMacOnline] = useState(false);
  const [macLiveServices, setMacLiveServices] = useState(macServices);

  useEffect(() => {
    const wsPc = new WebSocket('ws://localhost:8000/ws/telemetry');
    wsPc.onopen = () => setPcOnline(true);
    wsPc.onclose = () => setPcOnline(false);
    wsPc.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPcLive(prev => ({
          ...prev,
          cpu: data.cpu_percent,
          ram_used: parseFloat((data.ram_used / (1024**3)).toFixed(1)),
          ram_total: parseFloat((data.ram_total / (1024**3)).toFixed(1)),
          disk_used: parseFloat((data.disk_used / (1024**3)).toFixed(0)),
          disk_total: parseFloat((data.disk_total / (1024**3)).toFixed(0)),
          gpu: data.gpu_util !== null ? data.gpu_util : prev.gpu,
          gpu_temp: data.gpu_temp !== null ? data.gpu_temp : prev.gpu_temp,
          vram_used: data.vram_used !== null ? parseFloat((data.vram_used / (1024**3)).toFixed(1)) : prev.vram_used,
        }));
      } catch (e) {}
    };

    const wsMac = new WebSocket('ws://localhost:8001/ws/telemetry');
    wsMac.onopen = () => setMacOnline(true);
    wsMac.onclose = () => setMacOnline(false);
    wsMac.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMacLive(prev => ({
          ...prev,
          cpu: data.cpu_percent,
          ram_used: parseFloat((data.ram_used / (1024**3)).toFixed(1)),
          ram_total: parseFloat((data.ram_total / (1024**3)).toFixed(1)),
          disk_used: parseFloat((data.disk_used / (1024**4)).toFixed(1)) || prev.disk_used,
          disk_total: parseFloat((data.disk_total / (1024**4)).toFixed(1)) || prev.disk_total,
        }));
        
        if (data.services && data.services.length > 0) {
            setMacLiveServices(data.services.map((s: any) => ({
                name: s.name,
                status: s.status === 'running' ? 'Running' : 'Stopped',
                color: s.status === 'running' ? '#06d6a0' : '#ef476f',
                isWhiteBg: false
            })));
        }
      } catch (e) {}
    };

    return () => {
      wsPc.close();
      wsMac.close();
    };
  }, []);

  const handleAction = async (endpoint: string, agent: 'pc' | 'mac' = 'pc') => {
    try {
        const port = agent === 'pc' ? 8000 : 8001;
        await fetch(`http://localhost:${port}${endpoint}`, { method: 'POST' });
    } catch (e) {
        console.error(e);
    }
  };

  const navItems = [
    { name: 'Overview', icon: <Home size={18} />, hasBg: true },
    { name: 'PC Control', icon: <Monitor size={18} /> },
    { name: 'Mac Mini', icon: <Apple size={18} /> },
    { name: 'AI Studio', icon: <Volume2 size={18} /> }, // Placeholder icon
    { name: 'Gaming', icon: <Gamepad2 size={18} /> },
    { name: 'Automations', icon: <Settings2 size={18} /> }, // Placeholder
    { name: 'Media', icon: <PlayCircle size={18} /> },
    { name: 'Tools', icon: <Settings2 size={18} /> }, // Placeholder
    { name: 'Settings', icon: <Settings size={18} /> },
  ];

  const renderProgressBar = (used: number, total: number, label: string, color: string) => {
    const percent = (used / total) * 100;
    return (
      <div className="progress-container">
        <div className="progress-labels">
          <span className="prog-title">{label}</span>
        </div>
        <div className="progress-values">
          <span className="prog-val">{used} / {total} {label.includes('Storage') || label.includes('SSD') ? (total > 10 ? 'GB' : 'TB') : 'GB'}</span>
          <span className="prog-pct">{Math.round(percent)}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percent}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
        </div>
      </div>
    );
  };

  const renderMetric = (label: string, value: string, temp?: string, color: string = '#06d6a0') => (
    <div className="metric-box">
      <div className="metric-label">{label}</div>
      <div className="metric-values">
        <span className="metric-val">{value}</span>
        {temp && <span className="metric-temp" style={{color}}>{temp}</span>}
      </div>
      <div className="metric-graph-placeholder" style={{borderBottom: `2px solid ${color}`}}>
        {/* SVG graph placeholder */}
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="graph-svg">
          <path d="M0 20 L 10 15 L 20 18 L 30 10 L 40 12 L 50 5 L 60 8 L 70 2 L 80 10 L 90 6 L 100 15 L 100 20 Z" fill={`${color}33`} />
          <path d="M0 20 L 10 15 L 20 18 L 30 10 L 40 12 L 50 5 L 60 8 L 70 2 L 80 10 L 90 6" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">U</div>
          <div className="brand-text">
            <span>UNSEEN</span>
            <span className="brand-bold">PANEL</span>
          </div>
        </div>
        
        <div className="nav-container">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li 
                key={item.name} 
                className={`nav-item ${activeTab === item.name ? 'active' : ''} ${item.hasBg ? 'has-bg' : ''}`}
                onClick={() => setActiveTab(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">S</div>
            <div className="user-info">
              <span className="user-name">Shariq</span>
              <span className="user-status text-success">Connected</span>
            </div>
          </div>
          <button className="btn-add-device">
            <PlusCircle size={16} /> Add Device
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button className="btn-home-top"><Home size={16}/> Home</button>
          </div>
          <div className="header-center">
            <div className="time-display">02:39 AM</div>
            <div className="date-display">Tue, 12 Aug 2025</div>
          </div>
          <div className="header-right">
            <div className="header-stat">
              <Globe size={16} className="text-muted"/>
              <div className="stat-text">
                <span className="stat-label">Network</span>
                <span className="stat-val text-success">↑ 42.6 Mbps &nbsp; <span className="text-cyan">↓ 18.7 Mbps</span></span>
              </div>
            </div>
            <div className="header-stat">
              <Cloud size={16} className="text-muted"/>
              <div className="stat-text">
                <span className="stat-label">Weather</span>
                <span className="stat-val"><span className="text-cyan">24°C</span> Clear</span>
              </div>
            </div>
            <MoonIcon size={18} className="text-primary mx-2" />
            <Settings size={18} className="text-muted" />
          </div>
        </header>

        <div className="dashboard-layout">
          
          {/* Left Column (PC, Mac, Gaming, AI) */}
          <div className="left-column">
            
            <div className="top-row">
              {/* WINDOWS PC */}
              <div className="card panel-card">
                <div className="card-header">
                  <h3>WINDOWS PC</h3>
                  <div className="status-badge"><div className={`dot ${pcOnline ? 'online' : 'offline'}`}></div> {pcOnline ? 'Online' : 'Offline'}</div>
                </div>
                <div className="device-header">
                  <div className="device-icon pc-icon"></div>
                  <div className="device-info">
                    <div className="device-os">{pcSys.os}</div>
                    <div className="device-cpu">{pcSys.cpu_name}</div>
                    <div className="device-gpu text-muted">{pcSys.gpu_name}</div>
                  </div>
                </div>
                
                <div className="metrics-grid">
                  {renderMetric('CPU', `${pcLive.cpu}%`, `${pcLive.cpu_temp}°C`, '#06d6a0')}
                  {renderMetric('GPU', `${pcLive.gpu}%`, `${pcLive.gpu_temp}°C`, '#9d4edd')}
                  
                  {renderProgressBar(pcLive.ram_used, pcLive.ram_total, 'RAM', '#9d4edd')}
                  {renderProgressBar(pcLive.vram_used, pcLive.vram_total, 'VRAM', '#00b4d8')}
                  
                  <div className="progress-container full-width">
                     <div className="progress-labels">
                        <span className="prog-title">SSD (C:)</span>
                        <span className="prog-pct">{Math.round((pcLive.disk_used/pcLive.disk_total)*100)}%</span>
                     </div>
                     <div className="progress-values mb-1">
                        <span className="prog-val">{pcLive.disk_used} GB / {pcLive.disk_total} GB</span>
                     </div>
                     <div className="progress-bar-bg">
                       <div className="progress-bar-fill" style={{ width: `${(pcLive.disk_used/pcLive.disk_total)*100}%`, backgroundColor: '#9d4edd' }}></div>
                     </div>
                  </div>

                  <div className="network-block">
                    <span className="prog-title">Network</span>
                    <div className="net-vals text-success">↑ {pcLive.net_upload_mbps} Mbps</div>
                    <div className="net-vals text-primary">↓ {pcLive.net_download_mbps} Mbps</div>
                    {/* SVG placeholder for network graph */}
                    <div className="net-graph-placeholder"></div>
                  </div>
                  
                  <div className="fan-block">
                    <span className="prog-title">Fan Speed</span>
                    <div className="flex items-center gap-2 mt-2">
                       <Settings2 size={16} className="text-muted spin" />
                       <span className="text-white font-medium">{pcLive.fan_speed} RPM</span>
                    </div>
                  </div>
                </div>

                <button className="btn-full-width">Open Dashboard</button>
              </div>

              {/* MAC MINI */}
              <div className="card panel-card">
                <div className="card-header">
                  <h3>MAC MINI M1</h3>
                  <div className="status-badge"><div className={`dot ${macOnline ? 'online' : 'offline'}`}></div> {macOnline ? 'Online' : 'Offline'}</div>
                </div>
                <div className="device-header">
                  <div className="device-icon mac-icon"><Apple size={24} color="black"/></div>
                  <div className="device-info">
                    <div className="device-os">{macSys.os}</div>
                    <div className="device-cpu">{macSys.cpu_name}</div>
                    <div className="device-gpu text-muted">{macSys.ram}</div>
                  </div>
                </div>
                
                <div className="metrics-grid">
                  {renderMetric('CPU', `${macLive.cpu}%`, `${macLive.cpu_temp}°C`, '#00b4d8')}
                  
                  {renderProgressBar(macLive.ram_used, macLive.ram_total, 'RAM', '#00b4d8')}
                  {renderProgressBar(macLive.disk_used, macLive.disk_total, 'Storage', '#00b4d8')}
                  
                  <div className="network-block full-width-net">
                    <span className="prog-title">Network</span>
                    <div className="flex gap-4">
                      <div className="net-vals text-success">↑ {macLive.net_upload_mbps} Mbps</div>
                      <div className="net-vals text-primary">↓ {macLive.net_download_mbps} Mbps</div>
                    </div>
                    <div className="net-graph-placeholder blue"></div>
                  </div>
                  
                  <div className="uptime-block">
                    <span className="prog-title">Uptime</span>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock size={14} className="text-muted"/>
                       <span className="text-white font-medium">{macLive.uptime}</span>
                    </div>
                  </div>
                  
                  <div className="services-block">
                    <span className="prog-title">Services</span>
                    <div className="status-badge mt-1"><div className="dot online"></div> {macLiveServices.filter(s => s.status === 'Running').length} Running</div>
                  </div>
                </div>

                <button className="btn-full-width btn-blue">Open Dashboard</button>
              </div>
            </div>

            <div className="bottom-row">
              {/* GAMING */}
              <div className="card panel-card gaming-card">
                <div className="card-header border-none pb-0">
                  <h3 className="text-primary">GAMING</h3>
                </div>
                <div className="game-info mt-2">
                  <div className="game-art">
                     <img src="https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art_y.jpg" alt="Cyberpunk" className="game-img" onError={(e) => e.currentTarget.style.display='none'}/>
                  </div>
                  <div className="game-stats-right">
                    <div className="flex justify-between w-full">
                       <div className="game-title">Cyberpunk 2077</div>
                       <div className="status-badge"><div className="dot online"></div> Running</div>
                    </div>
                    <div className="game-metrics">
                      <div><span className="prog-title">FPS</span><br/><span className="text-white font-bold text-lg">82</span> FPS</div>
                      <div><span className="prog-title">GPU</span><br/><span className="text-white font-bold text-lg">98%</span></div>
                      <div><span className="prog-title">CPU</span><br/><span className="text-white font-bold text-lg">64%</span></div>
                    </div>
                  </div>
                </div>
                <div className="game-memory-row mt-4">
                   <div>
                     <span className="prog-title">VRAM</span>
                     <div className="text-white mt-1">13.1 / 16 GB</div>
                   </div>
                   <div>
                     <span className="prog-title">RAM</span>
                     <div className="text-white mt-1">12.4 / 16 GB</div>
                   </div>
                   <div>
                     <span className="prog-title">GPU Temp</span>
                     <div className="text-white mt-1">67°C</div>
                   </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="btn-full-width btn-outline">Game Dashboard</button>
                  <button className="btn-full-width btn-outline">Capture Screenshot</button>
                </div>
              </div>

              {/* AI STUDIO */}
              <div className="card panel-card ai-card">
                 <div className="card-header border-none pb-0">
                  <h3 className="text-cyan">AI STUDIO</h3>
                 </div>
                 
                 <div className="ai-section mt-3">
                   <div className="flex justify-between items-center mb-3">
                     <div className="flex items-center gap-2">
                       <div className="ai-icon lm-studio">🧠</div>
                       <span className="text-white font-medium">LM Studio</span>
                     </div>
                     <div className="status-badge"><div className="dot online"></div> Running</div>
                   </div>
                   <div className="ai-metrics grid grid-cols-4 gap-2 mb-3">
                      <div><span className="prog-title">Model</span><br/><span className="text-white text-sm">Gemma 4 31B</span></div>
                      <div><span className="prog-title">Tokens / sec</span><br/><span className="text-white text-sm">8.7 tok/s</span></div>
                      <div><span className="prog-title">GPU Util.</span><br/><span className="text-white text-sm">45%</span></div>
                      <div><span className="prog-title">VRAM</span><br/><span className="text-white text-sm">11.2 / 16 GB</span></div>
                   </div>
                   <div className="flex gap-3">
                     <button className="btn-full-width btn-cyan-dark">Open LM Studio</button>
                     <button className="btn-full-width btn-danger-dark"><Power size={14}/> Stop Server</button>
                   </div>
                 </div>

                 <div className="ai-section mt-4 pt-4 border-t">
                   <div className="flex justify-between items-center mb-3">
                     <div className="flex items-center gap-2">
                       <div className="ai-icon comfy">🎨</div>
                       <span className="text-white font-medium">ComfyUI</span>
                     </div>
                     <div className="status-badge"><div className="dot offline bg-gray"></div> Idle</div>
                   </div>
                   <div className="flex gap-3">
                     <button className="btn-full-width btn-cyan-dark">Start ComfyUI</button>
                     <button className="btn-full-width btn-cyan-dark">Open ComfyUI</button>
                   </div>
                 </div>
              </div>
            </div>

          </div>

          {/* Right Column (Quick Launch, System Controls, Server) */}
          <div className="right-column">
            
            {/* QUICK LAUNCH */}
            <div className="card section-card">
              <div className="card-header flex justify-between">
                <h3>QUICK LAUNCH</h3>
                <Edit2 size={14} className="text-muted cursor-pointer" />
              </div>
              <div className="quick-launch-grid">
                {quickLaunchApps.map(app => (
                  <div key={app.name} className="ql-item">
                    <div className="ql-icon" style={{backgroundColor: `${app.color}22`, color: app.color}}>
                       {app.icon}
                    </div>
                    <span className="ql-label">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SYSTEM CONTROLS */}
            <div className="card section-card">
              <div className="card-header flex justify-between">
                <h3>SYSTEM CONTROLS</h3>
                <Edit2 size={14} className="text-muted cursor-pointer" />
              </div>
              <div className="sys-controls-grid">
                <button className="ctrl-btn" onClick={() => handleAction('/api/system/lock', 'pc')}><Lock size={18} className="text-primary"/> Lock PC</button>
                <button className="ctrl-btn" onClick={() => handleAction('/api/system/sleep', 'pc')}><Moon size={18} className="text-white"/> Sleep</button>
                <button className="ctrl-btn" onClick={() => handleAction('/api/system/restart', 'pc')}><Activity size={18} className="text-white"/> Restart</button>
                <button className="ctrl-btn" onClick={() => handleAction('/api/system/shutdown', 'pc')}><Power size={18} className="text-danger"/> Shut Down</button>
                
                <button className="ctrl-btn"><Volume1 size={18} className="text-white"/> Volume -</button>
                <button className="ctrl-btn"><VolumeX size={18} className="text-white"/> Mute</button>
                <button className="ctrl-btn"><Volume2 size={18} className="text-white"/> Volume +</button>
                <button className="ctrl-btn"><MicOff size={18} className="text-danger"/> Mic Mute</button>
                
                <button className="ctrl-btn"><Camera size={18} className="text-white"/> Screenshot</button>
                <button className="ctrl-btn"><Clipboard size={18} className="text-white"/> Clipboard</button>
                <button className="ctrl-btn"><Trash size={18} className="text-white"/> Clear Temp</button>
                <button className="ctrl-btn"><MonitorOff size={18} className="text-white"/> Turn Off Mon</button>
              </div>
            </div>

            {/* SERVER (MAC MINI) */}
            <div className="card section-card">
              <div className="card-header">
                <h3 className="text-cyan">SERVER (MAC MINI)</h3>
              </div>
              <div className="server-list">
                {macLiveServices.map((svc, i) => (
                  <div key={i} className="server-item">
                    <div className="flex items-center gap-3 w-1/3">
                       <div className="svc-icon" style={{backgroundColor: svc.isWhiteBg ? '#fff' : svc.color}}></div>
                       <span className="text-white text-sm">{svc.name}</span>
                    </div>
                    <div className="w-1/3 text-center">
                       <span className={svc.status === 'Running' ? 'text-success text-sm' : 'text-danger text-sm'}>{svc.status}</span>
                    </div>
                    <div className="w-1/3 flex justify-end">
                       <button className="btn-open">Open</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Media Player Bar */}
      <footer className="media-bar-full">
        <div className="media-left">
           <img src="https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png" alt="Album" className="media-art" onError={(e) => e.currentTarget.style.display='none'}/>
           <div className="media-text">
             <div className="media-title">Blinding Lights</div>
             <div className="media-artist text-muted">The Weeknd</div>
           </div>
        </div>
        
        <div className="media-center">
           <div className="media-controls-main">
             <SkipBack size={20} className="media-icon"/>
             <Pause size={28} className="media-icon text-white" fill="white"/>
             <SkipForward size={20} className="media-icon"/>
           </div>
           <div className="media-timeline flex items-center gap-3">
             <div className="timeline-bar">
               <div className="timeline-fill" style={{width: '45%'}}></div>
               <div className="timeline-thumb"></div>
             </div>
             <span className="time-text text-muted">1:34 / 3:20</span>
           </div>
        </div>
        
        <div className="media-right">
           <div className="flex items-center gap-2">
             <div className="app-icon vlc text-warning">▶</div>
             <div className="flex-col">
               <span className="text-white text-sm">VLC Media Player</span>
               <span className="text-success text-xs">Playing</span>
             </div>
           </div>
           <div className="flex items-center gap-2 ml-6">
             <Volume2 size={18} className="text-muted"/>
             <div className="vol-bar">
               <div className="vol-fill" style={{width: '45%'}}></div>
               <div className="vol-thumb"></div>
             </div>
             <span className="text-muted text-xs ml-1">45%</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
