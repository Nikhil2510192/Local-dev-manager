import { parseDockerOutput } from '../utils/parseDocker';
import { runCommand } from './processService';

export async function getContainers() {
  const response = await runCommand('docker ps -a --format "{{.Names}}|{{.Image}}|{{.Status}}"');
  if (!response.success && response.stdErr) {
    throw new Error(response.stdErr);
  }

  return parseDockerOutput(response.stdOut || '');
}

export async function startContainer(name) {
  return runCommand(`docker start ${name}`);
}

export async function stopContainer(name) {
  return runCommand(`docker stop ${name}`);
}
