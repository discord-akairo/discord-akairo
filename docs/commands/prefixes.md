# Prefixes

### Mentioning

Sometimes people can forget or not know the prefix for your bot, so letting them use command with a mention is useful.  
This can be enabled with the `allowMention` property.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    allowMention: true,
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

Now both `?ping` and `@BOT ping` works!  

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
Longer prefixes should be first in the list.  
If it was the other way around, (`['??', '???']`), `??` would be found first and `???secret` would be parsed as `??` and `?secret` instead.  
