# Basic Commands

### Ping Command

Our first order of business is to make a ping command.  
No bot is complete without one!  

In the last tutorial, we specified that the `commandDirectory` is in `./commands/`.  
So, go there, make a new file, and require Akairo.  

```js
const { Command } = require('discord-akairo');
```

There are two ways to make modules in Akairo.  
Both are equally valid, so choose whichever you like.  

```js
// As an instance.
// Pro: Shorter code.
// Con: Relies on using the `function`
// keyword for the context of `this`.
module.exports = new Command(...);

// As a class.
// Pro: Does not rely on `function`,
// and also more easily extendable.
// Con: Longer code.
class PingCommand extends Command { ... }
module.exports = PingCommand;
```

In other tutorials, we will be using the second method, as it is less confusing for use.  
Here is a basic ping command:  

```js
const { Command } = require('discord-akairo');

class PingCommand extends Command {
    constructor() {
        super('ping', {
           aliases: ['ping'] 
        });
    }
    
    exec(message) {
        return message.reply('Pong!');
    }
}

module.exports = PingCommand;
```

The first parameter is the unique ID of the command.  
It is not seen nor used by users, but you should keep it the same as one of the aliases.  

The second parameter is the options.  
The only option there right now are the aliases, which are the names of the command for the users to call.  

The exec method is the execution function, ran when the command is called.  
You should try to always return a value such as a Promise with it, so that the framework can tell when a command finishes.  

Using the instance method, the above would look like so:  

```js
const { Command } = require('discord-akairo');

function exec(message) {
    return message.reply('Pong!');
}

module.exports = new Command('ping', exec, {
    aliases: ['ping']
});
```

If everything was done correctly, your command should now work!  
Because there are a lot of things that can be changed for commands, they will be explained further in other tutorials.  
