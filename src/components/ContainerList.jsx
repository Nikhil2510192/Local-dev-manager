import { useEffect, useState } from 'react';
import { getContainers, startContainer, stopContainer } from '../services/dockerService';

export default function ContainerList({ onLog }) {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadContainers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getContainers();
      setContainers(data);
      onLog('[docker] Refreshed container list');
    } catch (err) {
      setError(err.message || 'Failed to load containers');
      onLog(`[docker:error] ${err.message || 'Failed to load containers'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const handleAction = async (name, action) => {
    try {
      const response = action === 'start' ? await startContainer(name) : await stopContainer(name);
      onLog(`[docker] ${action} ${name}\n${response.stdOut || response.stdErr || 'done'}`);
      await loadContainers();
    } catch (err) {
      onLog(`[docker:error] ${err.message || `Unable to ${action} ${name}`}`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Docker Containers</h2>
        <button className="px-3 py-1 text-sm bg-sky-600 text-white rounded hover:bg-sky-700" onClick={loadContainers}>
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading containers...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="space-y-2">
        {containers.map((container) => {
          const running = container.status.toLowerCase().startsWith('up');
          return (
            <div key={container.name} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">{container.name}</p>
                <p className="text-xs text-slate-500">{container.image}</p>
                <p className="text-xs text-slate-500">{container.status}</p>
              </div>
              <button
                className={`px-3 py-1 text-sm rounded text-white ${running ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                onClick={() => handleAction(container.name, running ? 'stop' : 'start')}
              >
                {running ? 'Stop' : 'Start'}
              </button>
            </div>
          );
        })}
        {containers.length === 0 && !loading && <p className="text-sm text-slate-500">No containers found.</p>}
      </div>
    </div>
  );
}
