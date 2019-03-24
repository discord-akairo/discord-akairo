# CommandUtil

### Handling Edits

The CommandUtil class is a utility class for working with responses.  
In order to make it available, you must enable either `handleEdits` or `commandUtil`.  
Because they can use a bit of memory if there are many messages, `commandUtilLifetime` should be set.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 600000,
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

Now, CommandUtil is available on messages with the property `util`.  
You can CommandUtil methods such as `send` in order to send responses.  
With `handleEdits` on, the `send` methods will edits responses accordingly.  
This works for prompts as well.  

```js
const { Command } = require('discord-akairo');

class HelloCommand extends Command {
    constructor() {
        super('hello', {
            aliases: ['hello']
        });
    }

    exec(message) {
        // Also available: util.reply()
        return message.util.send('Hello!');
    }
}

module.exports = HelloCommand;
```

As an example of what that means:  

- User sends `?ping` (message A).
- Bot replies with `Pong!` (message B).
- User edits message A to `?hello`.
- Bot edits message B to `Hello!`.

### Prefix and Alias

CommandUtil can also be used to view the prefix and alias used.  
The format for command is almost always `<prefix><alias> <arguments>`.  
Since you have the arguments for parsing already, CommandUtil stores the first two for you.  

```js
const { Command } = require('discord-akairo');

class HelloCommand extends Command {
    constructor() {
        super('hello', {
            aliases: ['hello', 'hi', 'konnichiha', 'bonjour', 'heyo']
        });
    }

    exec(message) {
        if (message.util.alias === 'konnichiha') {
            return message.util.send('こんにちは！');
        }

        if (message.util.alias === 'bonjour') {
            return message.util.send('Bonjour!');
        }

        return message.util.send('Hello!');
    }
}

module.exports = HelloCommand;
```

With that, you can see which alias was used by the user.  

You can see the prefix as well.  
For example, if you have two prefixes, `?` and `!`, `message.util.prefix` will be either `?` or `!`.  

CommandUtil, if enabled, is available on all messages just after built-in pre-inhibitors.  
This means an invalid input, e.g. `?not-a-command` will still be parsed with prefix of `?` and alias of `not-a-command`.  
