# Cooldowns

### No Spam!

Cooldowns are how you make sure that troublemakers don't spam your bot.  
Akairo allows you to set cooldowns in uses per milliseconds.  

```js
const { Command } = require('discord-akairo');
const exampleAPI = require('example-api');

class RequestCommand extends Command {
    constructor() {
        super('request', {
            aliases: ['request'],
            cooldown: 10000,
            ratelimit: 2
        });
    }

    exec(message) {
        return exampleAPI.fetchInfo().then(info => {
            return message.reply(info);
        });
    }
}

module.exports = RequestCommand;
```

`cooldown` is the amount of time a user would be in cooldown for.  
`ratelimit` is the amount of uses a user can do before they are denied usage.  

In simple terms, this means 2 uses every 10000 milliseconds.  

If you wish to set a default cooldown for all commands, the `defaultCooldown` option is available:  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    defaultCooldown: 1000,
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

When someone uses a command while in cooldown, the event `commandCooldown` will be emitted on the command handler with the remaining time in milliseconds.  
