import { useState } from 'react';
import { runCommand } from '../services/processService';

export default function PortChecker({ onLog }) {
  const [port, setPort] = useState('3000');
  const [status, setStatus] = useState('');

  const checkPort = async () => {
    const cleanPort = String(port).trim();
    if (!cleanPort) {
      return;
    }

    const isWindows = navigator.userAgent.toLowerCase().includes('windows');
    const command = isWindows
      ? `netstat -ano | findstr :${cleanPort}`
      : `lsof -i :${cleanPort}`;

    try {
      const result = await runCommand(command);
      if (result.success && result.stdOut.trim()) {
        setStatus(`Port ${cleanPort} is in use`);
      } else {
        setStatus(`Port ${cleanPort} appears available`);
      }

      onLog(`[port] Checked ${cleanPort}\n${result.stdOut || result.stdErr || 'no active process found'}`);
    } catch (err) {
      setStatus(`Error checking port ${cleanPort}`);
      onLog(`[port:error] ${err.message || 'Port check failed'}`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Port Checker</h2>
      <div className="flex gap-2">
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          placeholder="Enter port"
        />
        <button className="px-3 py-2 text-sm rounded bg-teal-600 text-white hover:bg-teal-700" onClick={checkPort}>
          Check
        </button>
      </div>
      {status && <p className="text-sm text-slate-600 mt-3">{status}</p>}
    </div>
  );
}
