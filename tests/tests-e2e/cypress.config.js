const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    WEB_URL: "http://localhost:3000",
    API_URL: "http://localhost:8080",
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "admin",
  },
});
