let config;

const serviceName = null;

if (process.env.NODE_ENV === 'production') {
  config = {
    apps: [{
      script: 'index.js',
      name: serviceName,
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      autorestart: true,
      restart_delay: 2000
    }]
  };
} else {
  config = {
    apps: [{
      script: 'index.js',
      name: serviceName,
      instances: 1,
      exec_mode: 'cluster',
      watch: ['index.js', 'dist'],
      ignore_watch: ['node_modules', 'start']
    }]
  };
}

module.exports = config;
