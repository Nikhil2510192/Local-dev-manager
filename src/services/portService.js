/**
 * Port Service - Diagnostic version
 * Logs everything so we can see what's going wrong
 */

function assertNeutralinoRuntime() {
  if (!window.Neutralino || !window.Neutralino.os) {
    throw new Error('Neutralino runtime not available');
  }
}

/**
 * Check if a port is in use - DIAGNOSTIC VERSION
 */
export async function isPortInUse(port) {
  assertNeutralinoRuntime();

  try {
    const isWindows = navigator.userAgent.includes('Windows');

    if (isWindows) {
      // Windows: netstat -ano | findstr :PORT
      const result = await window.Neutralino.os.execCommand(
        `cmd.exe /c netstat -ano | findstr :${port}`
      );

      console.log(`========== NETSTAT DEBUG FOR PORT ${port} ==========`);
      console.log('Command: cmd.exe /c netstat -ano | findstr :' + port);
      console.log('stdOut:', JSON.stringify(result.stdOut));
      console.log('stdErr:', JSON.stringify(result.stdErr));
      console.log('exitCode:', result.exitCode);
      console.log('stdOut length:', result.stdOut.length);
      console.log('stdOut lines:', result.stdOut.split('\n').length);
      
      if (result.stdOut) {
        console.log('Lines:');
        result.stdOut.split('\n').forEach((line, idx) => {
          console.log(`  [${idx}]: "${line}"`);
        });
      }
      console.log('==============================================\n');

      // Check if there's any output
      if (!result.stdOut || result.stdOut.trim().length === 0) {
        console.log(`Port ${port} NOT in use (no netstat output)`);
        return { inUse: false, pid: null };
      }

      // Parse output
      const lines = result.stdOut.trim().split('\n');
      console.log(`Found ${lines.length} line(s) for port ${port}`);
      
      // Get last line (most recent connection)
      const lastLine = lines[lines.length - 1];
      console.log(`Last line: "${lastLine}"`);
      
      const parts = lastLine.trim().split(/\s+/);
      console.log(`Parts after split:`, parts);
      
      // PID is last number
      let pid = null;
      for (let i = parts.length - 1; i >= 0; i--) {
        const num = parseInt(parts[i]);
        if (!isNaN(num) && num > 0) {
          pid = num;
          console.log(`Found PID: ${pid} at index ${i}`);
          break;
        }
      }

      const result_final = { inUse: pid !== null, pid: pid };
      console.log(`RESULT: inUse=${result_final.inUse}, pid=${result_final.pid}\n`);
      return result_final;
    }

    // Linux/Mac: lsof -i :PORT
    const result = await window.Neutralino.os.execCommand(`lsof -i :${port}`);

    console.log(`========== LSOF DEBUG FOR PORT ${port} ==========`);
    console.log('stdOut:', result.stdOut);
    console.log('stdErr:', result.stdErr);
    console.log('==============================================\n');

    if (!result.stdOut || result.stdOut.trim().length === 0) {
      return { inUse: false, pid: null };
    }

    const lines = result.stdOut.split('\n');
    if (lines.length > 1) {
      const parts = lines[1].split(/\s+/);
      const pid = parseInt(parts[1]);
      return { inUse: !isNaN(pid), pid: isNaN(pid) ? null : pid };
    }

    return { inUse: false, pid: null };

  } catch (error) {
    console.error(`ERROR checking port ${port}:`, error);
    return { inUse: false, pid: null };
  }
}

export async function killProcessByPid(pid) {
  assertNeutralinoRuntime();

  if (!pid) {
    return { success: false, message: 'No PID provided' };
  }

  try {
    const isWindows = navigator.userAgent.includes('Windows');

    if (isWindows) {
      const result = await window.Neutralino.os.execCommand(
        `cmd.exe /c taskkill /PID ${pid} /F`
      );

      if (result.exitCode === 0 || result.stdOut.includes('SUCCESS')) {
        return { success: true, message: `Process ${pid} terminated` };
      } else {
        return { success: false, message: result.stdErr || 'Failed to kill process' };
      }
    }

    const result = await window.Neutralino.os.execCommand(`kill -9 ${pid}`);

    if (result.exitCode === 0) {
      return { success: true, message: `Process ${pid} terminated` };
    } else {
      return { success: false, message: result.stdErr || 'Failed to kill process' };
    }
  } catch (error) {
    console.error(`ERROR killing PID ${pid}:`, error);
    return { success: false, message: error.message || 'Error killing process' };
  }
}

export async function stopServerByPort(port) {
  assertNeutralinoRuntime();

  try {
    const portStatus = await isPortInUse(port);

    if (!portStatus.inUse || !portStatus.pid) {
      return { success: false, message: `No process found on port ${port}` };
    }

    return await killProcessByPid(portStatus.pid);
  } catch (error) {
    console.error(`ERROR stopping port ${port}:`, error);
    return { success: false, message: error.message || 'Failed to stop server' };
  }
}