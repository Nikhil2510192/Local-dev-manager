export function parseEnv(content) {
  const env = {};

  content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const idx = line.indexOf('=');
      if (idx === -1) {
        return;
      }

      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1);
      env[key] = value;
    });

  return env;
}

export function stringifyEnv(envObj) {
  return Object.entries(envObj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}
