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
- Web: User Interface

# Setup

## Configuration File

Server, Agents and Web Interface need a configuration file.

### Server

config.json:

```
{
  "CORS_POLICY_ORIGIN": "a_domain",     // Authorized domain for the user interface. Default: same as Server
  "DATA_DIR": "/data",                  // Directory where data are saved. Default: Current directory
  "AGENT_KEY": "TO_CHANGE",             // Key needed for Agents to connect to Server
  "JWT_KEY": "TO_CHANGE",               // Key use to encode JWT tokent. Default: random
  "JWT_VALIDITY_DURATION": 604800,      // Validity duration (in seconds) of the JWT token. Default: 604800 (1 week)
  "TASK_HISTORY_MAX_COUNT": 100,        // Maximium number of execution kept. Detault: 100
  "TASK_HISTORY_MAX_AGE_DAYS": 30,      // Maximum age (in days) of execution kept. Default: 30 days
  "AGENT_REGISTRATION_DURATION": 1800   // Durration (in seconds) that agent are considered as connected. Default: 1800 (30 min)
}
```

The path of the configuration file must be given with the environment vairiable: `TELEPATHY_CONFIG`

### Agent

config.json:

```
{
  "AGENT_ID": "agent_name",            // Name of the agent. Default: hostname
  "SERVER": "http://localhost:8080",   // Url of the server
  "HEARTBEAT_CYCLE": 60,               // Frequency (in seconds) at which the agent will connect to the server. Default: 60
  "AGENT_KEY": "TO_CHANGE",            // Key needed for Agents to connect to Server (must be same as the one defined on the Server)
  "TAGS": ["linux_x86", "cloud"]       // Tags associated to this agent. Default: [] (no tag)
}
```

The path of the configuration file must be given with the environment vairiable: `TELEPATHY_CONFIG`

### Web

config.json:

```
{
  "SERVER_URL": "http://localhost:30000"   // Url of the server
}
```

## Run the Services

The services can be executed either

- From Docker images (recommended)
- From the binaries (for some agents)
- From the source code (not recommended)

### Docker and Kubernetes

Images are available on Docker Hub:

- https://hub.docker.com/r/didierhoarau/telepathy-web
- https://hub.docker.com/r/didierhoarau/telepathy-server
- https://hub.docker.com/r/didierhoarau/telepathy-agent

Example of Kubernetes confirmation:

[Kubernetes Example](docs/example_kubernetes)[]

Example of Docker Swarm (or Docker Compose) configuration:

TODO

### Binaries

Binary are available only for agent for now. Server and Web Interface have to be deployed with Docker or source

Binary are available in the release files: [https://github.com/DidierHoarau/telepathy/releases]

Syntax:

```bash
TELEPATHY_CONFIG=./config-agent.json
./telepathy-agent

```

### Sources

```bash
git clone https://github.com/DidierHoarau/telepathy
cd telepathy

# Server
cd telepathy-server
npm ci
npm build
TELEPATHY_CONFIG=../../config-agent.json node dist/app.js &

# Agent
cd ../telepathy-agent
npm ci
npm build
TELEPATHY_CONFIG=../../config-agent.json node dist/app.js &

# Web
cd ../telepathy-agent
# Update telepathy-web/public/config/config.json
npm ci
npm run dev &
```

## Note on Ubuntu Requirements

For the Server, on Ubuntu x64 or arm64

```bash
sudo apt-get install build-essential g++
```
