import * as fse from 'fs-extra';

class Config {
  //
  public static readonly CLIENT_VERSION_FILE: string = '/opt/telepathy/version-client';
  public static readonly CONFIG_FILE: string = '/etc/telepathy/config-client.json';
  public CLIENT_ARCH: string = 'telepathy-client-linux-x64';
  public CLIENT_VERSION: string = 'undefined';
  public UPDATE_AUTO: boolean = false;
  public UPDATE_URL_INFO: string = 'undefined';
  public UPDATE_URL_BINARY: string = 'undefined';

  public constructor() {
    this.reload();
  }

  public async reload(): Promise<void> {
    const content = await fse.readJson(Config.CONFIG_FILE);
    const setIfSet = field => {
      if (content[field]) {
        this[field] = content[field];
      }
    };
    setIfSet('UPDATE_AUTO');
    setIfSet('UPDATE_URL_INFO');
    setIfSet('UPDATE_URL_BINARY');
    try {
      this.CLIENT_VERSION = (await fse.readFile(Config.CLIENT_VERSION_FILE))
        .toString()
        .split('\n')[0];
    } catch (err) {
      this.CLIENT_VERSION = 'undefined';
    }
  }
}

export const config = new Config();
