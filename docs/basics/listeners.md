# Basic Listeners

### Setup

Listeners are a basic concept in Node.js.  
Problem is, you usually end up with loooooong files attaching listeners on your client.  
And plus, you can't reload them as easily!  

Let's add some listeners.  
You have to setup a `ListenerHandler` just like with commands and inhibitors.  

```js
const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');

class MyClient extends AkairoClient {
    constructor() {
        super({
            ownerID: '123992700587343872',
        }, {
            disableMentions: 'everyone'
        });

        this.commandHandler = new CommandHandler(this, {
            directory: './commands/',
            prefix: '?'
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: './inhibitors/'
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './listeners/'
        });
    }
}

const client = new MyClient();
client.login('TOKEN');
```

Then, tell it to load all the modules.  
The command handler may need to use the listener handler for some operations later on, so it should use it as well:  

```js
this.commandHandler.useListenerHandler(this.listenerHandler);
this.listenerHandler.loadAll();
```

### I'm Ready!

And now, we can make a listener!   
Let's start with a simple client `ready` event.  

```js
const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    exec() {
        console.log('I\'m ready!');
    }
}

module.exports = ReadyListener;
```

The first parameter in `super` is the listener's unique ID.  

The second parameter are the options.  
First, we have the emitter's name.  
Then, we have the event we want to listen to.  

Then the exec method, whose parameters are the event's.  

### Custom Emitters

By default, the `client` emitter is the only one available.  
Handlers in Akairo are also EventEmitters, so we can have our listener handler listen to our handlers.  
Using `setEmitters`, we can set custom emitters:  

```js
this.listenerHandler.setEmitters({
    commandHandler: this.commandHandler,
    inhibitorHandler: this.inhibitorHandler,
    listenerHandler: this.listenerHandler
});
```

Note: You have to call `setEmitters` before `loadAll` or Akairo will not be able to resolve your emitters.

### Blocked Commands

Remember the `reason` for inhibitors in previous tutorial?  
They are emitted to the `messageBlocked` (anything with `pre` type or before) or `commandBlocked` (everything after) event by the command handler.  
Since we set the command handler to the key `commandHandler` up above, we have to use that as the `emitter` option.  

```js
const { Listener } = require('discord-akairo');

class CommandBlockedListener extends Listener {
    constructor() {
        super('commandBlocked', {
            emitter: 'commandHandler',
            event: 'commandBlocked'
        });
    }

    exec(message, command, reason) {
        console.log(`${message.author.username} was blocked from using ${command.id} because of ${reason}!`);
    }
}

module.exports = CommandBlockedListener;
```

And if you want your listeners to run only once, you add the option `type` with the value of `'once'`.  
