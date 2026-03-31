export default function LogsPanel({ logs }) {
  return (
    <div className="rounded-xl bg-slate-900 text-slate-100 p-4 shadow-md h-[280px] overflow-auto">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 mb-3">Command Logs</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-slate-400">No logs yet.</p>
      ) : (
        <div className="space-y-3 text-xs font-mono whitespace-pre-wrap">
          {logs.map((log, index) => (
            <div key={`${index}-${log.slice(0, 12)}`} className="border-b border-slate-700 pb-2">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
