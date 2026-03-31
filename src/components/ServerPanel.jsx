import { useState, useEffect } from 'react';
import servers from '../config/servers.json';
import { runCommand } from '../services/processService';
import { isPortInUse, stopServerByPort } from '../services/portService';

export default function ServerPanel({ onLog }) {
  const [runningServers, setRunningServers] = useState(new Set());
  const [serverStatus, setServerStatus] = useState({});

  // Check port status when component mounts and every 5 seconds
  useEffect(() => {
    checkAllPorts();
    const interval = setInterval(checkAllPorts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check which servers are actually running
  const checkAllPorts = async () => {
    const status = {};
    
    for (const server of servers) {
      if (!server.port) {
        status[server.name] = { isRunning: false, message: 'No port configured' };
        continue;
      }

      const result = await isPortInUse(server.port);
      
      // Log the port check result
      onLog(`[server] Port ${server.port} check: inUse=${result.inUse}, pid=${result.pid}`);
      
      status[server.name] = {
        isRunning: result.inUse,
        port: server.port,
        pid: result.pid,
        message: result.inUse 
          ? `✅ Running on port ${server.port} (PID: ${result.pid})`
          : `❌ Not running (port ${server.port} available)`
      };
    }

    setServerStatus(status);
  };

  const runServer = async (server) => {
    if (runningServers.has(server.name)) {
      onLog(`[server:warn] ${server.name} is already running`);
      return;
    }

    setRunningServers(new Set([...runningServers, server.name]));
    onLog(`[server] ✅ Starting: ${server.name}`);
    onLog(`[server] $ ${server.command}`);

    try {
      const result = await Promise.race([
        runCommand(server.command, server.cwd),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Startup timeout')), 5000)
        )
      ]);

      if (result.stdOut) {
        onLog(`[server] ${result.stdOut}`);
      }
      if (result.stdErr) {
        onLog(`[server:error] ${result.stdErr}`);
      }

      onLog(`[server] ✅ ${server.name} started successfully`);
      
      // Check ports immediately and then every second for up to 10 seconds
      checkAllPorts();
      let checkCount = 0;
      const quickCheck = setInterval(async () => {
        checkCount++;
        await checkAllPorts();
        
        // Stop checking after 10 attempts or when server is found
        if (checkCount >= 10 || serverStatus[server.name]?.isRunning) {
          clearInterval(quickCheck);
        }
      }, 1000);
      
    } catch (err) {
      if (err.message === 'Startup timeout') {
        onLog(`[server] ✅ ${server.name} is now running`);
        
        // Check ports immediately and then every second for up to 10 seconds
        checkAllPorts();
        let checkCount = 0;
        const quickCheck = setInterval(async () => {
          checkCount++;
          await checkAllPorts();
          
          // Stop checking after 10 attempts or when server is found
          if (checkCount >= 10 || serverStatus[server.name]?.isRunning) {
            clearInterval(quickCheck);
          }
        }, 1000);
      } else {
        onLog(`[server:error] Failed to start ${server.name}: ${err.message}`);
        setRunningServers(prev => {
          const next = new Set(prev);
          next.delete(server.name);
          return next;
        });
      }
    }
  };

  const stopServer = async (server) => {
    if (!server.port) {
      onLog(`[server:error] No port configured for ${server.name}`);
      return;
    }

    onLog(`[server] Stopping: ${server.name}...`);

    try {
      const result = await stopServerByPort(server.port);

      if (result.success) {
        onLog(`[server] ✅ ${server.name} stopped successfully`);
        setRunningServers(prev => {
          const next = new Set(prev);
          next.delete(server.name);
          return next;
        });
        // Re-check ports after stopping
        setTimeout(checkAllPorts, 1000);
      } else {
        onLog(`[server:error] Failed to stop ${server.name}: ${result.message}`);
      }
    } catch (err) {
      onLog(`[server:error] Error stopping ${server.name}: ${err.message}`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Dev Server Runner</h2>
      <div className="space-y-2">
        {servers.map((server) => {
          const status = serverStatus[server.name];
          const isRunning = status?.isRunning || false;

          return (
            <div
              key={server.name}
              className={`p-3 rounded-lg border-2 flex items-center justify-between transition-all ${
                isRunning
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-slate-800">{server.name}</p>
                <p className="text-xs text-slate-500">{server.command}</p>
                <p className="text-xs text-slate-500">cwd: {server.cwd}</p>
                {status && (
                  <p className={`text-xs mt-1 ${
                    isRunning ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {status.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                {!isRunning ? (
                  <button
                    className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
                    onClick={() => runServer(server)}
                  >
                    Run
                  </button>
                ) : (
                  <>
                    <button
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white cursor-default whitespace-nowrap"
                      disabled
                    >
                      ✅ Running
                    </button>
                    <button
                      className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 whitespace-nowrap"
                      onClick={() => stopServer(server)}
                      title="Stop this server"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}