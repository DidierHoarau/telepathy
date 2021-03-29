import axios from 'axios';

let config;

export default class Config {
  public static async get(): Promise<any> {
    if (!config) {
      config = (await axios.get('/config/config.json')).data;
    }
    return config;
  }
}
