import { useState } from 'react';
import { readProjectEnv, writeProjectEnv } from '../services/envService';

export default function EnvEditor({ onLog }) {
  const [envFilePath, setEnvFilePath] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const canUseFileActions = Boolean(envFilePath);

  const handleSelectEnvFile = async () => {
    try {
      if (!window.Neutralino || !window.Neutralino.os) {
        throw new Error('Neutralino runtime is not available.');
      }

      // File picker - removed .env filter to show all files
      const result = await window.Neutralino.os.showOpenDialog(
        'Select .env file',
        {
          properties: ['openFile']
          // Removed: filters: [{ name: '.env files', extensions: ['.env'] }, ...]
          // Now shows all files so user can see .env files
        }
      );

      if (result && result.length > 0) {
        const selectedPath = result[0];
        setEnvFilePath(selectedPath);
        setStatus('File selected');
        onLog(`[env] Selected file: ${selectedPath}`);
      }
    } catch (err) {
      setStatus('Failed to select file');
      onLog(`[env:error] ${err.message || 'Failed to select .env file'}`);
    }
  };

  const loadEnv = async () => {
    if (!envFilePath) {
      return;
    }

    try {
      const result = await readProjectEnv(envFilePath);
      
      if (!result.success) {
        setContent('');
        setStatus('Failed to load .env');
        onLog(`[env:error] ${result.message}`);
        return;
      }
      
      setContent(result.raw || '');
      setStatus('Loaded successfully');
      onLog(`[env] ✅ Loaded .env (${(result.raw || '').length} chars)`);
    } catch (err) {
      setContent('');
      setStatus('Failed to load .env');
      onLog(`[env:error] ${err.message || 'Failed to load .env'}`);
    }
  };

  const saveEnv = async () => {
    if (!envFilePath) {
      return;
    }

    if (!content.trim()) {
      setStatus('Cannot save empty file');
      return;
    }

    try {
      const result = await writeProjectEnv(envFilePath, content);
      
      if (!result.success) {
        setStatus('Failed to save .env');
        onLog(`[env:error] ${result.message}`);
        return;
      }
      
      setStatus('Saved successfully');
      onLog(`[env] ✅ Saved .env`);
    } catch (err) {
      setStatus('Failed to save .env');
      onLog(`[env:error] ${err.message || 'Failed to save .env'}`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">.env Editor</h2>

      <p className="text-sm text-slate-700 mb-3">
        Current File: {envFilePath ? envFilePath : 'None selected'}
      </p>

      <div className="flex gap-2 mb-3">
        <button
          className="px-3 py-2 text-sm rounded bg-slate-700 text-white hover:bg-slate-800"
          onClick={handleSelectEnvFile}
        >
          Select .env File
        </button>
        <button
          className="px-3 py-2 text-sm rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={loadEnv}
          disabled={!canUseFileActions}
        >
          Load
        </button>
        <button
          className="px-3 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={saveEnv}
          disabled={!canUseFileActions}
        >
          Save
        </button>
      </div>

      <textarea
        className="w-full h-56 rounded border border-slate-300 p-3 font-mono text-xs disabled:bg-slate-100 disabled:text-slate-500"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={canUseFileActions ? 'KEY=value' : 'Select a .env file to load and edit'}
        disabled={!canUseFileActions}
      />

      {status && <p className="text-sm text-slate-600 mt-2">{status}</p>}
    </div>
  );
}