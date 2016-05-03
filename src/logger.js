import * as winston from 'winston';
import {options} from './options';
import * as path from 'path';

const ops = options()
let transports = [
  new winston.transports.Console({ level: ops.ll, colorize: true, timestamp: true }),
  new winston.transports.File({ level: ops.ll, filename: path.join(process.cwd(),'log',ops.name + '.log'), timestamp: true })
];

if(ops.logio) {
  transports.push( new winston.transports.Logio, {
    port: 28777,
    node_name: ops.name,
    host: ops.logioHost
  });
}

let Logger = {};
const logger = new winston.Logger({ transports: transports });

['error','warn','info','verbose','debug','silly'].forEach((method) => {
  Logger[method] = function () {
    logger[method].apply(logger, sliceName(this.name,arguments));
  }
});

function getLogger(name) {
  return Object.assign({ name: name },Logger);
}


export {getLogger};


function sliceName(name,a) {
  const args = Array.prototype.slice.call(a);
  args.unshift(name + '|');
  return args;
}
