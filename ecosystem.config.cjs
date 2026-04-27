module.exports = {
  apps: [{
    name: 'real-estate-backend',
    script: './dataServer.js',
    cwd: '/opt/data/home/real_estate_spa',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/opt/data/home/real_estate_spa/logs/error.log',
    out_file: '/opt/data/home/real_estate_spa/logs/out.log',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
  }]
}
