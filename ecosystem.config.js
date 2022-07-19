module.exports = {
  apps: [
    {
      name: "telepathy-shared",
      cwd: "_shared",
      script: "npm",
      args: "run dev",
      watch: true,
      autorestart: false,
      ignore_watch: ["node_modules"],
      watch_options: {
        usePolling: true,
        interval: 1000,
      },
    },
    {
      name: "telepathy-agent",
      cwd: "telepathy-agent",
      script: "npm",
      args: "run dev",
      watch: true,
      ignore_watch: ["node_modules"],
      watch_options: {
        usePolling: true,
        interval: 1000,
      },
      env_development: {
        DEV_MODE: "true",
        TELEPATHY_CONFIG: "../_dev/config/config-agent.json",
        TELEPATHY_DATA_DIR: "../_dev/data/server",
        OPENTELEMETRY_COLLECTOR_HTTP: "http://localhost:4318/v1/traces",
      },
    },
    {
      name: "telepathy-server",
      cwd: "telepathy-server",
      script: "npm",
      args: "run dev",
      watch: true,
      ignore_watch: ["node_modules"],
      watch_options: {
        usePolling: true,
        interval: 1000,
      },
      env_development: {
        DEV_MODE: "true",
        TELEPATHY_CONFIG: "../_dev/config/config-server.json",
        TELEPATHY_DATA_DIR: "../_dev/data/server",
        OPENTELEMETRY_COLLECTOR_HTTP: "http://localhost:4318/v1/traces",
      },
    },
    {
      name: "telepathy-web",
      cwd: "telepathy-web",
      script: "npm",
      args: "run dev",
      watch: false,
      autorestart: false,
    },
  ],
};
