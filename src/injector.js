import {_} from 'lodash'
import * as logger from './logger'
const log = logger.getLogger('injector.js')
const Consumer = require('./consumer.js').Consumer
const Publisher = require('./publisher.js').Publisher
let injectables = { Promise: require('bluebird'), publisher: Publisher, logger: logger, consumer: undefined }
const Injector = {
  parseArguments: function parseArguments(fn) {
    let args = /\(\s*([^)]+?)\s*\)/.exec(fn.toString());
    if (args[1]) {
      args = args[1].split(/\s*,\s*/);
    }
    log.verbose('parsed arguments',args);
    return args;
  },
  inject: function inject(fn,options) {
    injectables.options = options
    injectables.consumer = Consumer(options)
    const args = this.parseArguments(fn);
    
    const parsed = args.map((t) => {
      return injectables[t] || require(t)
    });
    fn.apply(undefined,parsed);
  }
}

export {Injector}