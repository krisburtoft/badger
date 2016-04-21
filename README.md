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

````javascript

  let cons = new Consumer('consumer')
  cons.bind('abcd',handler).then(function() {
    new Logger('test').info('listening on queue [\'abcd\']')
  })

  function handler(msg) {
    new Logger('handler').info('msg',msg.body)
    return msg.body
  }

  cons.on('ready', onReadyFunc)
  cons.on('error', handleError)
````

## Logger

````
  let log = new Logger('logname')
  log.error('mmsg')
  log.warn('msg')
  log.debug('msg')
  log.verbose('msg')
  log.silly('msg')
