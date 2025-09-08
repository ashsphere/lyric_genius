#!/usr/bin/env node
const { spawn } = require('node:child_process');

const procs = [];

function run(name, args) {
  const p = spawn('npm', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  procs.push(p);
  p.on('exit', (code, signal) => {
    console.log(`[${name}] exited with`, { code, signal });
    // If one process exits, stop all and exit with its code
    shutdown(code ?? (signal ? 1 : 0));
  });
}

function shutdown(code = 0) {
  while (procs.length) {
    const p = procs.pop();
    if (!p.killed) {
      try { p.kill('SIGINT'); } catch {}
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// Run API and FE in parallel using workspaces
run('api', ['run', 'dev', '-w', '@lyricgenius/api']);
run('frontend', ['run', 'dev', '-w', '@lyricgenius/frontend']);

