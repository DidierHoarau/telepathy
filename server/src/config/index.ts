import * as fs from 'fs';

const CONFIG_FILE = `${__dirname}/config-${process.env.NODE_ENV || 'default'}.json`;

class Config {
  //
  public readonly API_PATH: string = '/api';
  public foo: string = `bar`;

  public constructor() {
    const content = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (content.foo) {
      this.foo = content.foo;
    }
  }
}

export const config = new Config();
