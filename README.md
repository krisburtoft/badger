# bunny-bump

_Utility class library_

## Injector

````javascript
  import {Injector} from 'bunny-bump';

  function injectable(lodash) {
   console.log(lodash.last);
  }

  Injector.inject(injectable);
````
output >> [Function: last]

## Consumer

The consumer module will allow you to create an AMQP RabbitMQ consumer which will bind to the specified broker, queue, and routeKey

````javascript
  import {Consumer} from 'bunny-bump'
  
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
  import {Publisher} from 'bunny-bump'
  
  Publisher({broker: 'amqp://guest:guest@localhost'}).then((publisher) => {
      publisher.getReply({foo: 'bar'},'foo-consumer').then((response) => {
        console.log('foo-consumer response',response)
      }).catch(console.error.bind(console))
    })
````

## Logger

````javascript
  import {getLogger} from 'bunny-bump'
  
  let log = getLogger('logname')
  log.error('mmsg')
  log.warn('msg')
  log.debug('msg')
  log.verbose('msg')
  log.silly('msg')
````

##Putting it all together...

##AmqpMicro

Create a microservice consumer like so...
````javascript
  import {AmqpMicro} from 'bunny-bump'

  const defaults = {
    broker: 'amqp://guest:guest@lacalhost',
    name: 'my-microservice-queue',
    exchange: 'topic://my-topic-exchange',
    ll: 'VERBOSE'
  }

  AmqpMicro(defaults,function(options,consumer,publisher,logger) {
      const log = logger.getLogger('myicroservice-logger')
      consumer.bind('my-routeKey',(msg) => {
        log.info('msg received', msg)
        //make some other rabbitmq request and return the promise.
        return publisher.getReply('other-route', (otherMsg) => {
            //results of this will be the response of this microservice request.
            return otherMsg
          })
      })
    }
  )
````