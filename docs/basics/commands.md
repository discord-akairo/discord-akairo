# Basic Commands

### The Command Handler

In Akairo, the hierachy is that there are handlers which contains modules.  
The handlers deals with loading modules and executing them.  
For commands, we will import and instantiate the `CommandHandler`.  

```js
const { AkairoClient, CommandHandler } = require('discord-akairo');

class MyClient extends AkairoClient {
    constructor() {
        super({
            ownerID: '123992700587343872', // or ['123992700587343872', '86890631690977280']
        }, {
            disableMentions: 'everyone'
        });

        this.commandHandler = new CommandHandler(this, {
            // Options for the command handler goes here.
        });
    }
}

const client = new MyClient();
client.login('TOKEN');
```

Now, for some options.  
The `directory` option tells the handler where the main set of commands modules are at.  
The `prefix` option is simply the prefixes you want to use, you can have multiple too!  

```js
this.commandHandler = new CommandHandler(this, {
    directory: './commands/',
    prefix: '?' // or ['?', '!']
});
```

And now that the command handler has been setup, we simply have to tell it to load the modules.  

```js
this.commandHandler.loadAll();
```

### Ping Command

Our first order of business is to make a ping command.  
No bot is complete without one!  

We specified that the `directory` is in `./commands/`.  
So, go there, make a new file, and require Akairo.  

```js
const { Command } = require('discord-akairo');
```

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

The first parameter of `super` is the unique ID of the command.  
It is not seen nor used by users, but you should keep it the same as one of the aliases.  

The second parameter is the options.  
The only option there right now are the aliases, which are the names of the command for the users to call.  
Note that the ID of the command is not an alias!  

The exec method is the execution function, ran when the command is called.  
You should try to always return a value such as a Promise with it, so that the framework can tell when a command finishes.  

If everything was done correctly, your command should now work!  
Because there are a lot of things that can be changed for commands, they will be explained further in other tutorials.  
