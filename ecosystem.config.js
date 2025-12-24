// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "cricket-node-mongo-api",
      script: "./index.js",
      exec_mode: "cluster",
      instances: 3, // NOT max

      max_memory_restart: "600M",
      listen_timeout: 8000,
      kill_timeout: 8000,

      merge_logs: true,
      time: true,

      node_args: "--max-old-space-size=512"
    }
  ]
};

