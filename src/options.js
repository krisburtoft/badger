const minimist = require('minimist')

function options(overrides) {
  let defaults = {
    broker: 'amqp://guest:guest@localhost',
    exchange: 'topic://default-topic',
    ll: 'warn',
    name: 'bunny-bump'
  };
  var merged = Object.assign(defaults,overrides);

  return minimist(process.argv.slice(2), { default: merged, boolean: [] });
}

export { options };