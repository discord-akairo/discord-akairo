# Prefixes and Aliases

### Mentioning

Sometimes people can forget or not know the prefix for your bot, so letting them use command with a mention is useful.  
This can be enabled with the `allowMention` option.  

```js
this.commandHandler = new CommandHandler(this, {
    directory: './commands/',
    prefix: '?',
    allowMention: true
});
```

Now both `?ping` and `@BOT ping` works!  

### Changeable Prefixes

A prefix can change based on the message.  
Use a function as the `prefix` option to do so.  
This is most useful with an actual database to back it up, so check out the [Using Providers](../other/providers.md) section.  

```js
this.commandHandler = new CommandHandler(this, {
    directory: './commands/',
    prefix: msg => {
        // Get prefix here...
        return prefix;
    },
    allowMention: true
});
```

### Prefix Overrides

Prefix overrides are command-specific prefixes.  
To use them, simply add the `prefix` option.  

```js
const { Command } = require('discord-akairo');

class SecretCommand extends Command {
    constructor() {
        super('secret', {
            aliases: ['secret'],
            prefix: '???'
        });
    }

    exec(message) {
        return message.reply('Woah! How did you find this!?');
    }
}

module.exports = SecretCommand;
```

Now, if our prefix was `?`, `?secret` won't work, but `???secret` would.  
An array works too, so you can do `prefix: ['???', '??']` and both would work.  

### Automatic Aliases

To speed up your development, you can make command aliases automatically.  
For example, if you had a command alias that is two words, you might want both `command-name` and `commandname` to be valid.  
Use the `aliasReplacement` option, which takes a regular expression to make aliases:  

```js
this.commandHandler = new CommandHandler(this, {
    directory: './commands/',
    prefix: '?',
    aliasReplacement: /-/g,
    allowMention: true
});
```

The option is passed `/-/g` which means that all dashes are to be removed to make an alias.  
So now, in a command, you can pass `aliases: ['command-name']` and both `command-name` and `commandname` would be valid.  
