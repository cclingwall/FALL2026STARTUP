module.exports = {
  apps: [{
    name: 'startup',
    cwd: __dirname,
    script: './service/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' },
  }],
};
