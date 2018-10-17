import * as fse from 'fs-extra';

class Config {
  //
  public static readonly VERSION: string = '2018.10';
  public static readonly CONFIG_FILE: string = '/etc/telepathy/config.json';
  public UPDATE_URL_INFO: string = 'undefined';
  public UPDATE_URL_BINARY: string = 'undefined';

  public constructor() {
    this.reload();
  }

  public async reload(): Promise<void> {
    const content = JSON.parse(await fse.readFile(Config.CONFIG_FILE, 'utf8'));
    const setIfSet = field => {
      if (content[field]) {
        this[field] = content[field];
      }
    };
    setIfSet('UPDATE_URL_INFO');
    setIfSet('UPDATE_URL_BINARY');
  }
}

export const config = new Config();
