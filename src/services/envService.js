import { parseEnv, stringifyEnv } from '../utils/parseEnv';

/**
 * EnvService - Pure NeutralinoJS File Management
 * ✅ 100% NeutralinoJS
 */

function assertNeutralinoRuntime() {
  if (!window.Neutralino || !window.Neutralino.filesystem) {
    throw new Error('Neutralino runtime not available');
  }
}

function normalizePath(path) {
  if (!path) return '';
  return path.replace(/\\/g, '/');
}

function getFolderPath(filePath) {
  const normalized = normalizePath(filePath);
  const parts = normalized.split('/');
  parts.pop();
  return parts.join('/');
}

function isEnvFile(path) {
  const normalized = normalizePath(path).toLowerCase();
  return normalized.endsWith('.env');
}

// ============================================================================
// Core File Operations
// ============================================================================

export async function readEnv(filePath) {
  assertNeutralinoRuntime();

  const normalizedPath = normalizePath(filePath);

  try {
    const content = await window.Neutralino.filesystem.readFile(normalizedPath);
    
    return {
      raw: content,
      parsed: parseEnv(content),
      path: normalizedPath,
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to read .env: ${error.message}`
    };
  }
}

export async function writeEnv(filePath, data) {
  assertNeutralinoRuntime();

  const normalizedPath = normalizePath(filePath);
  const payload = typeof data === 'string' ? data : stringifyEnv(data);

  try {
    await window.Neutralino.filesystem.writeFile(normalizedPath, payload);
    
    return {
      path: normalizedPath,
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to write .env: ${error.message}`
    };
  }
}

export async function envFileExists(filePath) {
  assertNeutralinoRuntime();

  try {
    const normalizedPath = normalizePath(filePath);
    await window.Neutralino.filesystem.getFileStats(normalizedPath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Main Functions - FIXED
// ============================================================================

/**
 * Read .env from project path (can be folder or file)
 * 
 * Input can be:
 * - Folder: C:/Users/project
 * - File: C:/Users/project/.env
 * 
 * Returns: { raw, parsed, path, success }
 */
export async function readProjectEnv(projectPath) {
  assertNeutralinoRuntime();

  const normalizedPath = normalizePath(projectPath);
  
  // FIX: If already a .env file, use it directly
  if (isEnvFile(normalizedPath)) {
    return readEnv(normalizedPath);
  }
  
  // If it's a folder, look for .env in it
  const envPath = `${normalizedPath}/.env`;
  return readEnv(envPath);
}

/**
 * Write .env to project path (can be folder or file)
 */
export async function writeProjectEnv(projectPath, data) {
  assertNeutralinoRuntime();

  const normalizedPath = normalizePath(projectPath);
  
  // FIX: If already a .env file, use it directly
  let envPath = normalizedPath;
  if (!isEnvFile(normalizedPath)) {
    envPath = `${normalizedPath}/.env`;
  }
  
  return writeEnv(envPath, data);
}