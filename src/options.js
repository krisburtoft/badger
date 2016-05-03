
function options(overrides) {
  let defaults = {
    broker: 'amqp://guest:guest@localhost',
    exchange: 'topic://medseek-api',
    ll: 'warn',
    name: 'badger'
  };
  var merged = Object.assign(defaults,overrides);

  return require('minimist')(process.argv.slice(2), { default: merged, boolean: [] });
}


export { options };