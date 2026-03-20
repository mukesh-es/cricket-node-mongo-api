// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "cricket-node-mongo-api",
      script: "./index.js",

      exec_mode: "cluster",
      instances: 3,

      // Memory tuning
      node_args: "--max-old-space-size=768",
      max_memory_restart: "900M",

      // Graceful reloads
      listen_timeout: 8000,
      kill_timeout: 8000,

      // Logs
      merge_logs: true,
      time: true,

      // Stability
      autorestart: true,
      watch: false,

      // Environment
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
