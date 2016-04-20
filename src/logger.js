import * as winston from 'winston';
import * as options from './options';
import * as path from 'path';


let transports = [
  new winston.transports.Console({ level: options.ll, colorize: true, timestamp: true }),
  new winston.transports.File({ level: options.ll, filename: path.join(process.cwd(),'log',options.name + '.log'), timestamp: true })
];

if(options.logio) {
  transports.push( new winston.transports.Logio, {
    port: 28777,
    node_name: options.name,
    host: options.logioHost
  });
}
let logger = new winston.Logger({ transports: transports });

class Logger {
  constructor(name) {
    this.name = name;
  }
  static sliceName(name,a) {
    const args = Array.prototype.slice.call(a);
    args.unshift(name + '|');
    return args;
  }
}

['error','warn','info','verbose','debug','silly'].forEach((method) => {
  Logger.prototype[method] = function () {
    logger[method].apply(logger, Logger.sliceName(this.name,arguments));
  }
});

export {Logger};
