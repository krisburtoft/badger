# badger

_Utility class library_

## Injector

````javascript
  import {Injector} from 'badger';

  function injectable(lodash) {
   console.log(lodash.last);
  }

  Injector.inject(injectable);
````
output >> [Function: last]

## Consumer

The consumer module will allow you to create an AMQP RabbitMQ consumer which will bind to the specified broker, queue, and routeKey

````javascript
  import {Consumer} from 'badger'
  
  let cons = Consumer({ broker: 'amqp://guest:guest@lacalhost', exchange: 'topic://my-topic-exchange', name: 'my-queue-name'})

  /* 
    Bind the route 'abcd' of the 'my-queue-name' queue to the `handler` function
  */
  cons.bind('abcd',handler)

  function handler(msg) {
    log.info('msg',msg.body)
    return msg.body
  }

  cons.on('ready', () => {
    log.info('consumer ready');
  })
  cons.on('error', () => {
    log.error('consumer ready');
  })
````

````javascript
  import {Publisher} from 'badger'
  
  Publisher({broker: 'amqp://guest:guest@localhost'}).then((publisher) => {
      publisher.getReply({foo: 'bar'},'foo-consumer').then((response) => {
        console.log('foo-consumer response',response)
      }).catch(console.error.bind(console))
    })
````

## Logger

````javascript
  import {getLogger} from 'badger'
  
  let log = getLogger('logname')
  log.error('mmsg')
  log.warn('msg')
  log.debug('msg')
  log.verbose('msg')
  log.silly('msg')
````