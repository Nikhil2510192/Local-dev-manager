export async function runCommand(command, cwd = '') {
  if (!window.Neutralino || !window.Neutralino.os) {
    throw new Error('Neutralino runtime is not available.');
  }

  const isWindows = navigator.userAgent.toLowerCase().includes('windows');
  const resolvedCommand = isWindows ? `cmd.exe /c ${command}` : command;

  const options = cwd ? { cwd } : {};
  const result = await window.Neutralino.os.execCommand(resolvedCommand, options);

  return {
    command,
    resolvedCommand,
    cwd,
    stdOut: result.stdOut || '',
    stdErr: result.stdErr || '',
    exitCode: typeof result.exitCode === 'number' ? result.exitCode : -1,
    success: result.exitCode === 0
  };
}
async function safeExec(cmd) {
  const isWindows = navigator.userAgent.includes("Windows");

  const finalCmd = isWindows
    ? `cmd.exe /c ${cmd}`
    : cmd;

  try {
    const result = await Promise.race([
      Neutralino.os.execCommand(finalCmd),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Command timeout")), 5000)
      )
    ]);

    return result;
  } catch (err) {
    return {
      stdOut: "",
      stdErr: err.message,
      exitCode: 1
    };
  }
}