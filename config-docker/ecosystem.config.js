module.exports = {
  apps: [
    {
      name: "proxy",
      script: "nginx",
      args: ["-g", "daemon off;"],
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "server",
      cwd: "/opt/app/telepathy-server",
      script: "dist/app.js",
      env: {
        NODE_ENV: "production",
        TELEPATHY_DATA_DIR: "/data",
      },
    },
    {
      name: "agent",
      cwd: "/opt/app/telepathy-agent",
      script: "dist/app.js",
      start_delay: 30000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
