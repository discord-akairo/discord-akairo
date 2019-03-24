# Custom Emitters

### Watching Process

Listeners can run on more than Akairo-related things.  
To add a custom emitter, use the `emitters` option on the client.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    emitters: {
        process
    },
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

The key will be the emitter's name, and the value is the emitter itself.  
Now, we can use a listener on the process:  

```js
const { Listener } = require('discord-akairo');

class UnhandledRejectionListener extends Listener {
    constructor() {
        super('unhandledRejection', {
            eventName: 'unhandledRejection',
            emitter: 'process'
        });
    }

    exec(error) {
        console.error(error);
    }
}

module.exports = UnhandledRejectionListener;
```
