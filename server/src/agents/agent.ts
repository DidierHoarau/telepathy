export class Agent {
  //
  public agentId: string;
  public lastSyncDate: Date;

  constructor(agentId: string) {
    this.agentId = agentId;
  }
}
