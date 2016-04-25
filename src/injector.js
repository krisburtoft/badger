import {_} from 'lodash';
import {getLogger} from './logger';
const log = getLogger('injector.js');

const Injector = {
  parseArguments: function parseArguments(fn) {
    let args = /\(\s*([^)]+?)\s*\)/.exec(fn.toString());
    if (args[1]) {
      args = args[1].split(/\s*,\s*/);
    }
    log.verbose('parsed arguments',args);
    return args;
  },
  inject: function inject(fn) {
    let args = this.parseArguments(fn);
    let parsed = args.map((t) => {
      return require(t);
    });
    fn.apply(undefined,parsed);
  }
}

export {Injector}