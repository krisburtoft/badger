const options = require('./options').options
const Injector = require('./injector').Injector

export function AmqpMicro (defaults, injectableFn) {
  defaults = options(defaults)
  Injector.inject(injectableFn,defaults)
}