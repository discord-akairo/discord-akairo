# Custom Emitters

### Watching Process

As shown in the first listener tutorial, we can have custom emitters.  
Listeners can run on more than Akairo-related things.  
To add a custom emitter, use the `setEmitters` method available on the listener handler.  

```js
this.listenerHandler.setEmitters({
    process: process,
    anything: youWant
});
```

Note: You have to call `setEmitters` before `load` or `loadAll` so that Akairo will be able to resolve your emitters.

The key will be the emitter's name, and the value is the emitter itself.  
Now, we can use a listener on the process:  

```js
const { Listener } = require('discord-akairo');

class UnhandledRejectionListener extends Listener {
    constructor() {
        super('unhandledRejection', {
            event: 'unhandledRejection',
            emitter: 'process'
        });
    }

    exec(error) {
        console.error(error);
    }
}

module.exports = UnhandledRejectionListener;
```
