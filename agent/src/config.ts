import * as fse from 'fs-extra';
import * as os from 'os';

class Config {
  //
  public readonly VERSION_FILE: string = '/opt/telepathy/version-agent';
  public readonly CONFIG_FILE: string = '/etc/telepathy/config-agent.json';
  public ARCH: string = 'telepathy-agent-linux-x64';
  public VERSION: string = 'undefined';
  public UPDATE_AUTO: boolean = false;
  public UPDATE_URL_INFO: string = 'undefined';
  public UPDATE_URL_BINARY: string = 'undefined';
  public MANAGED_FOLDERS: string[] = [];
  public SERVERS: string[] = [];
  public AGENT_ID: string = os.hostname();
  public SCAN_CYCLE_TIME: number = 2 * 60 * 1000;
  public LOG_DEBUG: boolean = false;

  public constructor() {
    this.reload();
  }

  public async reload(): Promise<void> {
    const content = await fse.readJson(this.CONFIG_FILE);
    const setIfSet = field => {
      if (content[field]) {
        this[field] = content[field];
      }
    };
    setIfSet('UPDATE_AUTO');
    setIfSet('UPDATE_URL_INFO');
    setIfSet('UPDATE_URL_BINARY');
    setIfSet('MANAGED_FOLDERS');
    setIfSet('SERVERS');
    setIfSet('AGENT_ID');
    setIfSet('SCAN_CYCLE_TIME');
    setIfSet('LOG_DEBUG');
    try {
      this.VERSION = (await fse.readFile(this.VERSION_FILE)).toString().split('\n')[0];
    } catch (err) {
      this.VERSION = 'undefined';
    }
  }
}

export const config = new Config();
