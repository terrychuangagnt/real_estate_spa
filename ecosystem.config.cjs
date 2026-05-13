const path = require('path')

const repoRoot = __dirname

module.exports = {
  apps: [{
    name: 'real-estate-backend',
    script: './dataServer.js',
    cwd: repoRoot,
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    error_file: path.join(repoRoot, 'logs', 'error.log'),
    out_file: path.join(repoRoot, 'logs', 'out.log'),
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
  }]
}
