import * as fse from 'fs-extra';

class Config {
  //
  public readonly CONFIG_FILE: string = '/etc/telepathy/config-server.json';
  public readonly VERSION_FILE: string = '/opt/telepathy/version-server';
  public readonly API_PORT: number = 3000;
  public ARCH: string = 'telepathy-server-linux-x64';
  public VERSION: string = 'undefined';
  public UPDATE_AUTO: boolean = false;
  public UPDATE_URL_INFO: string = 'undefined';
  public UPDATE_URL_BINARY: string = 'undefined';
  public MANAGED_FOLDERS: string[] = [];
  public SERVERS: string[] = [];
  public AGENT_REGISTRATION_DURATION: number = 30 * 60 * 1000;

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
    try {
      this.VERSION = (await fse.readFile(this.VERSION_FILE)).toString().split('\n')[0];
    } catch (err) {
      this.VERSION = 'undefined';
    }
  }
}

export const config = new Config();
