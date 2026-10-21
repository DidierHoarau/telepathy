export interface TaskOutputDefinition {
  id: string;
  name: string;
  pattern: string;
}

export interface TaskOutput {
  id: string;
  name: string;
  value: string;
  taskOutputDefinitionId?: string;
}

export interface Task {
  id: string;
  name: string;
  script: string;
  schedule?: string;
  tag?: string;
  webhook?: string;
  outputDefinitions?: TaskOutputDefinition[];
}

export interface TaskExecution {
  id: string;
  taskId: string;
  script?: string;
  status: string;
  success?: boolean;
  agentId?: string;
  tag?: string;
  dateQueued?: string;
  dateExecuting?: string;
  dateExecuted?: string;
  dateAgentAlive?: string;
  outputs?: TaskOutput[];
}

export interface Agent {
  id: string;
  tags?: string[];
  lastSyncDate?: string;
}

export interface User {
  id: string;
  name: string;
}

export interface ExecutionLogs {
  logs: string;
}
