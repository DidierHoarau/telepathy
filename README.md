Telepathy is a lightweight automation tool.

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

TODO

# Setup

## Configuration File

Both Server and Agent need a configuration file.

### Server

### Agent

## Run the Services

The services can be executed either

- From Docker images
- From the binaries
- From the source code

### Docker and Kubernetes

Images are available on Docker Hub:

- https://hub.docker.com/r/didierhoarau/telepathy-web
- https://hub.docker.com/r/didierhoarau/telepathy-server
- https://hub.docker.com/r/didierhoarau/telepathy-agent

Example of Kubernetes confirmation: TODO

Example of Docker Swarm (or Docker Compose) configuration: TODO

### Biinaries

TODO

## Note on Ubuntu Requirements

For Ubuntu x86 or arm64:

```bash
sudo apt-get install build-essential g++
```
