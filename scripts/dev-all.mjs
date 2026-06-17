/**
 * One command to run Speakwell locally: builds @fluentmap/core, then starts BOTH
 * the API server (:8787, the Gemini token-proxy + scoring) and the web app (:5188).
 *
 *   npm run dev:all
 *
 * Keep this terminal open and visit http://localhost:5188. Ctrl+C stops both.
 * (The voice + recap need the API server, so running only the web app makes the
 * conversation look "not connected".)
 */
import { spawn } from 'node:child_process';

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try {
      c.kill('SIGTERM');
    } catch {
      /* already gone */
    }
  }
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function prefix(name, chunk) {
  return chunk
    .toString()
    .split('\n')
    .filter((l) => l.length > 0)
    .map((l) => `[${name}] ${l}`)
    .join('\n');
}

function run(name, cmd, args) {
  const child = spawn(cmd, args, { shell: false });
  child.stdout.on('data', (d) => console.log(prefix(name, d)));
  child.stderr.on('data', (d) => console.error(prefix(name, d)));
  child.on('exit', (code) => {
    console.error(`[dev:all] "${name}" exited (code ${code}) — stopping everything.`);
    shutdown(code ?? 0);
  });
  children.push(child);
}

console.log('[dev:all] building @fluentmap/core …');
const build = spawn('npm', ['run', 'build', '-w', 'packages/core'], { stdio: 'inherit', shell: false });
build.on('exit', (code) => {
  if (code !== 0) {
    console.error('[dev:all] core build failed — fix the error above and re-run.');
    process.exit(code ?? 1);
  }
  console.log('[dev:all] starting API (:8787) + web (:5188) …');
  console.log('[dev:all] → open http://localhost:5188  (keep this terminal open)');
  run('api', 'node', ['server/index.mjs']);
  run('web', 'npm', ['run', 'dev', '-w', 'apps/web']);
});
