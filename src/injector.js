import {_} from 'lodash';

export class Injector { 
  constructor(resolvers) {
    this.resolvers = resolvers;
  }

  static parseArguments(fn) {
    let args = /\(\s*([^)]+?)\s*\)/.exec(fn.toString());
    if (args[1]) {
      args = args[1].split(/\s*,\s*/);
    }
    return args;
  }

  static inject(fn) {
    let args = Injector.parseArguments(fn);
    let parsed = args.map((t) => {
      return require(t);
    });
    fn.apply(undefined,parsed);
  }
}
