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
