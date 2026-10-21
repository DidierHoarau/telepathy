Telepathy is a lightweight automation tool.

![](docs/images/telepathy_task_list.png?raw=true)

![](docs/images/telepathy_task_edit.png?raw=true)

# Philosophy

The key aspects that this tool has been designed for:

## Lightweight

This tool is designed to have a very low memory, CPU and disk footprint. (less than 50MB for both server and agent while idle). There is no database needed as well.
The application is not designed for real time responsiness.

## System Shell

No specific language or plugin system to learn and use. Telepathy uses the system shell (typically: bash). Most commands can be automated with bash and this is the main way to execute code. If more is needed: more utilities can be installed at the system level and packaged together in a Docker images.

## Simplicity

More functions will be added with time but the core philosophy of this application is to remove all the unnecessary features. If a function can be simply automated with bash or Docker/Kubernetes it will probably not be added to the application.

# Architecture

![](docs/images/architecture.png?raw=true)

- Server: Stores the data, schedules the tasks to be executed, API for the web interface
- Agent: Executes the tasks

# Setup

## Configuration

Server and Agents read a JSON configuration file. Every value can also be overridden with an environment variable using the same name, which takes precedence over the configuration file.

The path of the configuration file is given with the environment variable `TELEPATHY_CONFIG`.

### Server

Note: the server also bundles an agent, so both agent and server parameters are supported.

config.json:

```jsonc
{
  "CORS_POLICY_ORIGIN": "a_domain",     // Authorized domain for the user interface. Default: same as Server
  "API_PORT": 8080,                     // Port of the API. Default: 8080
  "DATA_DIR": "/data",                  // Directory where data are saved. Default: /data
  "AGENT_KEY": "TO_CHANGE",             // Key needed for Agents to connect to Server
  "JWT_KEY": "TO_CHANGE",               // Key used to encode JWT tokens. Default: random
  "JWT_VALIDITY_DURATION": 8035200,     // Validity duration (in seconds) of the JWT token. Default: 8035200 (93 days)
  "TASK_HISTORY_MAX_COUNT": 100,        // Maximum number of executions kept. Default: 100
  "TASK_HISTORY_MAX_AGE_DAYS": 30,      // Maximum age (in days) of executions kept. Default: 30
  "AGENT_REGISTRATION_DURATION": 1800,  // Duration (in seconds) that agents are considered connected. Default: 1800 (30 min)
  "LOG_LEVEL": "info"                   // Log level: info or debug. Default: info
}
```

### Agent

config.json:

```jsonc
{
  "AGENT_ID": "agent_name",            // Name of the agent. Default: hostname
  "SERVER": "http://localhost:8080",   // Url of the server
  "HEARTBEAT_CYCLE": 60,               // Frequency (in seconds) at which the agent will connect to the server. Default: 60
  "AGENT_ENABLE": true,                // Enable the agent (can be used to disable the agent provided by default with the server)
  "AGENT_KEY": "TO_CHANGE",            // Key needed for Agents to connect to Server (must be the same as the one defined on the Server)
  "TAGS": ["linux_x86", "cloud"]       // Tags associated to this agent. Default: [] (no tag)
}
```

### OpenTelemetry

Traces, metrics and logs can be exported to an OTLP HTTP collector with:

```jsonc
{
  "OPENTELEMETRY_COLLECTOR_HTTP_TRACES": "http://localhost:4318/v1/traces",
  "OPENTELEMETRY_COLLECTOR_HTTP_METRICS": "http://localhost:4318/v1/metrics",
  "OPENTELEMETRY_COLLECTOR_HTTP_LOGS": "http://localhost:4318/v1/logs"
}
```

The legacy key `OPENTELEMETRY_COLLECTOR_HTTP` is still accepted as an alias for the traces endpoint.

## Run the Services

The services can be executed either

- From Docker images (recommended)
- From the source code

### Docker and Kubernetes

Images are available on Docker Hub:

- https://hub.docker.com/r/devopsplaybookio/telepathy
- https://hub.docker.com/r/devopsplaybookio/telepathy-agent

The agent image is available in two variants: Alpine (`latest`) and Ubuntu (`<version>-ubuntu`).

Example of Kubernetes configuration:

[Kubernetes Example](docs/example_kubernetes)

### Sources & Development

Prerequisites: Node.js 24+, npm, Docker and pm2.

```bash
git clone https://github.com/devopsplaybook-io/telepathy
cd telepathy

# Start the full stack (server, agent, web, proxy) with pm2
npm run dev
```

Applications can also be run individually:

```bash
# Server
cd telepathy-server
npm ci
npm run build
TELEPATHY_CONFIG=../_dev/config/config-server.json node dist/app.js

# Agent
cd telepathy-agent
npm ci
npm run build
TELEPATHY_CONFIG=../_dev/config/config-agent.json node dist/app.js

# Web
cd telepathy-web
npm ci
npm run dev
```

## Note on Ubuntu Requirements

For the Server, on Ubuntu x64 or arm64

```bash
sudo apt-get install build-essential g++
```
