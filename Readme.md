# Local Dev Environment Manager

A lightweight desktop application that consolidates all your local development tools into one unified interface. Built with **NeutralinoJS + React**, eliminating the need for multiple terminals and dashboards.

## 🎯 Overview

Instead of juggling multiple terminals, Docker CLI, port checkers, and text editors—manage everything from a single, clean interface. Perfect for developers working on projects with multiple services.

## ✨ Features

### 🐳 Docker Container Manager
- View all running containers with real-time status
- Start/stop containers with one click
- View container logs directly in the app
- Clean, organized container list

### 🖥️ Dev Server Launcher
- Run multiple development servers (frontend, backend, database, etc.)
- Auto-detect which servers are actually running on configured ports
- One-click start/stop for any server
- Real-time port status monitoring
- All logs displayed in unified command log

### 🔌 Port Checker
- Automatically detect which ports are in use
- View process ID (PID) for each running service
- Check port availability before starting new services
- Cross-platform support (Windows, Linux, Mac)

### ⚙️ .env File Editor
- Load and edit environment files from any project
- Save changes directly to file
- Multi-project support
- Simple, clean interface

### 📝 Unified Command Logs
- All Docker, server, and command outputs in one place
- Timestamped entries for easy tracking
- Color-coded status messages
- Real-time log updates

## 🛠️ Technology Stack

- **Frontend**: React 18 + Tailwind CSS
- **Runtime**: NeutralinoJS (lightweight alternative to Electron)
- **Native APIs**: System commands via Neutralino's `os.execCommand`
- **Build Tool**: Vite
- **No Node.js Runtime**: Pure native system integration

## 🚀 Why NeutralinoJS?

- **Lightweight**: ~15MB vs Electron's 150MB+
- **Fast startup**: Minimal overhead, instant response
- **Native webview**: Uses system browser capabilities
- **No runtime bundling**: Minimal dependencies
- **Cross-platform**: Single codebase for Windows, Linux, Mac

## 📦 Project Structure

```
src/
├── components/
│   ├── ContainerList.jsx      # Docker container management
│   ├── PortChecker.jsx         # Port availability checker
│   ├── ServerPanel.jsx         # Dev server launcher
│   ├── EnvEditor.jsx           # Environment file editor
│   ├── LogsPanel.jsx           # Command logs viewer
│   └── App.jsx                 # Main layout
├── services/
│   ├── dockerService.js        # Docker command execution
│   ├── processService.js       # General process runner
│   ├── portService.js          # Port detection & management
│   └── envService.js           # .env file operations
├── config/
│   └── servers.json            # Dev server configurations
└── utils/
    ├── parseEnv.js             # Environment file parsing
    └── (other utilities)

neutralino.conf.json            # NeutralinoJS configuration
```

## ⚙️ Configuration

### Dev Servers (servers.json)

Define which servers to manage in `src/config/servers.json`:

```json
[
  {
    "name": "Frontend Dev Server",
    "command": "npm run dev",
    "cwd": ".",
    "port": 5173
  },
  {
    "name": "API Server",
    "command": "npm run dev:api",
    "cwd": ".",
    "port": 3000
  }
]
```

Each server can have custom commands and working directories.

## 🏃 Getting Started

### Prerequisites
- Node.js 16+
- NeutralinoJS CLI: `npm install -g @neutralinojs/neu`
- Docker (optional, for Docker features)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd dev-manager

# Install dependencies
npm install

# Build the frontend
npm run build

# Run with NeutralinoJS
npm run neu:run
# or
neu run
```

### Development

```bash
# Start Vite dev server (for UI development only)
npm run dev

# Build for production
npm run build

# Run full app with NeutralinoJS
neu run
```

## 🔑 Key Features Explained

### Auto-Server Detection
The app automatically checks configured ports every 5 seconds to detect if servers are running. No need to manually click "refresh"—status updates in real-time.

### Cross-Platform Commands
All system commands are cross-platform aware:
- **Windows**: Uses `cmd.exe`, `netstat`, `taskkill`
- **Linux/Mac**: Uses `/bin/sh`, `lsof`, `kill`

### Clean Service Layer
Pure Neutralino API usage with no external dependencies:
```javascript
// Direct native command execution
await window.Neutralino.os.execCommand('npm run dev');
await window.Neutralino.filesystem.readFile('.env');
```

### Error Handling
Graceful degradation when running outside Neutralino:
```javascript
if (!window.Neutralino) {
  console.warn('Neutralino not available - running in browser mode');
}
```

## 🎓 Design Decisions

1. **No external npm packages for system tasks**: All Docker, port checking, and file operations use native Neutralino APIs
2. **Lightweight UI**: React + Tailwind CSS for minimal bundle size
3. **Configuration-driven servers**: Easy to add new servers without code changes
4. **Real-time status**: Automatic polling keeps UI in sync with system state
5. **Unified logging**: All operations logged in one place for debugging

## 📊 Architecture

```
┌─────────────────┐
│   React UI      │  (Interactive frontend)
├─────────────────┤
│ Service Layer   │  (Business logic)
│ - docker.js     │
│ - process.js    │
│ - port.js       │
│ - env.js        │
├─────────────────┤
│ Neutralino APIs │  (System integration)
│ - execCommand   │
│ - filesystem    │
│ - dialogs       │
├─────────────────┤
│ System          │  (Native OS)
│ - Docker daemon │
│ - Node.js       │
│ - File system   │
└─────────────────┘
```

## 🐛 Debugging

Enable DevTools in NeutralinoJS:
1. Press `CTRL + SHIFT + I` to open developer console
2. Check console logs for detailed error messages
3. Use Network tab to see all system commands being executed

## 📈 Future Enhancements

- [ ] Process restart on crash detection
- [ ] Multiple environment profiles
- [ ] Log export/filtering
- [ ] Custom server templates
- [ ] Git integration for quick project switching
- [ ] Performance metrics dashboard

## 🤝 Contributing

This project demonstrates best practices for NeutralinoJS development:
- Minimal abstraction over native APIs
- Clean separation of concerns
- Cross-platform compatibility
- User-focused design

## 📚 Learning Resources

- [NeutralinoJS Documentation](https://neutralino.js.org)
- [NeutralinoJS API Reference](https://neutralino.js.org/docs/api/overview)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)


## 🎯 Use Cases

- **Full-stack development**: Manage frontend + backend servers
- **Microservices**: Run multiple services from one interface
- **Docker workflows**: Quick container management without terminal
- **Multi-project work**: Switch between projects with .env management
- **Team development**: Standardized dev environment setup

---

**Built with ❤️ using NeutralinoJS - The lightweight desktop app framework**