import * as winston from 'winston';

winston.configure({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

export class Logger {
  private module: string;

  constructor(module: string) {
    this.module = `[${module}]`;
  }

  public debug(message: Error | string): void {
    winston.debug(this.module, message);
  }
  public info(message: Error | string): void {
    winston.info(this.module, message);
  }
  public warn(message: Error | string): void {
    winston.warn(this.module, message);
  }
  public error(message: Error | string): void {
    winston.error(this.module, message);
  }
}
