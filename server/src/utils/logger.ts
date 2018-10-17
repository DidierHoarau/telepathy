import * as logger from 'winston';

logger.configure({
  level: 'debug',
  transports: [
    new logger.transports.Console({
      colorize: true
    })
  ]
});

export class Logger {
  public static debug(message: Error | string): void {
    logger.debug(message);
  }
  public static info(message: Error | string): void {
    logger.info(message);
  }
  public static warn(message: Error | string): void {
    logger.warn(message);
  }
  public static error(message: Error | string): void {
    logger.error(message);
  }
}
