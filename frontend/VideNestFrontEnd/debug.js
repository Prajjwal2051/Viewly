import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const logFile = path.resolve('debug_output.txt');
const out = fs.openSync(logFile, 'w');
fs.writeSync(out, '--- DEBUG START ---\n');

console.log('Starting debug process...');

try {
  // Check if node_modules exists
  const nodeModulesPath = path.resolve('node_modules');
  if (fs.existsSync(nodeModulesPath)) {
      fs.writeSync(out, `node_modules exists at ${nodeModulesPath}\n`);
  } else {
      fs.writeSync(out, 'node_modules MISSING\n');
  }

  const child = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: ['ignore', out, out]
  });

  child.on('error', (err) => {
    fs.writeSync(out, `SPAWN ERROR: ${err.message}\n`);
  });

  child.on('exit', (code, signal) => {
     fs.writeSync(out, `EXIT: code=${code} signal=${signal}\n`);
  });

  setTimeout(() => {
    fs.writeSync(out, '--- TIMEOUT KILLING ---\n');
    child.kill();
    setTimeout(() => {
        process.exit(0);
    }, 500);
  }, 5000);

} catch (e) {
  fs.writeSync(out, `TOP LEVEL ERROR: ${e.message}\n`);
}
