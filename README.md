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
  import {Consumer} from 'badger'
  
  let cons = new Consumer('consumer')
  cons.bind('abcd',handler)

  function handler(msg) {
    new Logger('handler').info('msg',msg.body)
    return msg.body
  }

  cons.on('ready', () => {
    new Logger('ready').info('consumer ready');
  })
  cons.on('error', () => {
    new Logger('eventError').error('consumer ready');
  })
````

## Logger

````javascript
  import {Logger} from 'badger'
  
  let log = new Logger('logname')
  log.error('mmsg')
  log.warn('msg')
  log.debug('msg')
  log.verbose('msg')
  log.silly('msg')
````