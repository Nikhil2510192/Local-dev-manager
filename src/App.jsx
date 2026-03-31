import { useMemo, useState } from 'react';
import ContainerList from './components/ContainerList';
import EnvEditor from './components/EnvEditor';
import LogsPanel from './components/LogsPanel';
import PortChecker from './components/PortChecker';
import ServerPanel from './components/ServerPanel';

const tabs = [
  { id: 'docker', label: 'Docker' },
  { id: 'servers', label: 'Servers' },
  { id: 'ports', label: 'Ports' },
  { id: 'env', label: '.env' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('docker');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 80));
  };

  const panel = useMemo(() => {
    if (activeTab === 'docker') {
      return <ContainerList onLog={addLog} />;
    }

    if (activeTab === 'servers') {
      return <ServerPanel onLog={addLog} />;
    }

    if (activeTab === 'ports') {
      return <PortChecker onLog={addLog} />;
    }

    return <EnvEditor onLog={addLog} />;
  }, [activeTab]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 md:gap-6">
        <aside className="rounded-2xl bg-slate-900 text-white p-4 shadow-lg">
          <h1 className="text-lg font-semibold mb-4">Local Dev Environment Manager</h1>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeTab === tab.id ? 'bg-sky-500 text-slate-900 font-semibold' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <p className="text-xs text-slate-300 mt-6 leading-relaxed">
            Neutralino-native commands only. No Node.js runtime APIs used.
          </p>
        </aside>

        <main className="space-y-4 md:space-y-6">
          {panel}
          <LogsPanel logs={logs} />
        </main>
      </div>
    </div>
  );
}
