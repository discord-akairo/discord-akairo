# Basic Listeners

### I'm Ready!

Listeners are a basic concept in Node.js.  
Problem is, you usually end up with loooooong files attaching listeners on your client.  
And plus, you can't reload them as easily!  

Let's add some listeners.  
You have to setup a `listenerDirectory` just like with commands and inhibitors.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

And now, we can make some!  
Let's start with a simple client `ready` event.  

```js
const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            eventName: 'ready'
        });
    }

    exec() {
        console.log('I\'m ready!');
    }
}

module.exports = ReadyListener;
```

The first parameter is the listener's unique ID.  

The second parameter are the options.  
First, we have the emitter's name.  
Then, we have the event we want to listen to.  

Then there is its execution function, whose parameters are the event's.  

Here are the emitters that exist by default:  

- `client`
- `commandHandler`
- `inhibitorHandler`
- `listenerHandler`

### Blocked Commands

Remember the `reason` for inhibitors in previous tutorial?  
They are emitted to the `messageBlocked` (anything with `pre` type or before) or `commandBlocked` (everything after) event.  

Here's how you would listen to them:  

```js
const { Listener } = require('discord-akairo');

class CommandBlockedListener extends Listener {
    constructor() {
        super('commandBlocked', {
            emitter: 'commandHandler',
            eventName: 'commandBlocked'
        });
    }

    exec(message, command, reason) {
        console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
    }
}

module.exports = CommandBlockedListener;
```

And if you want your listeners to run only once:  

```js
const { Listener } = require('discord-akairo');

class CommandBlockedListener extends Listener {
    constructor() {
        super('commandBlocked', {
            emitter: 'commandHandler',
            eventName: 'commandBlocked',
            type: 'once'
        });
    }

    exec(message, command, reason) {
        console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
    }
}

module.exports = CommandBlockedListener;
```
