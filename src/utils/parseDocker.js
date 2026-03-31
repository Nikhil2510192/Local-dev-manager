export function parseDockerOutput(rawOutput) {
  return rawOutput
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, image, status] = line.split('|');
      return {
        name: (name || '').trim(),
        image: (image || '').trim(),
        status: (status || '').trim()
      };
    });
}
