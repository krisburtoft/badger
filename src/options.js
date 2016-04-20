let defaults = {
  broker: 'amqp://localhost',
  exchange: 'topic://medseek-api',
  ll: 'warn',
  name: 'badger'
};

const options = require('minimist')(process.argv.slice(2), { default: defaults, boolean: [] });

export { options };