# CommandUtil

### Handling Edits

The CommandUtil class is a utility class for working with responses.  
In order to make it available, you must enable `commandUtil`.  

```js
this.commandHandler = new CommandHandler(this, {
    directory: './commands/',
    prefix: '?',
    handleEdits: true,
    commandUtil: true
});
```

Now, CommandUtil is available on messages with the property `util`.  
An instance is kept for each message that go through command handling, but they have a lifetime of 5 minutes from then.  
To keep them alive longer, set a larger time in milliseconds using the `commandUtilLifetime` option.  
Note that this can build up memory usage really fast on larger bots, so it is recommended you give it a reasonable lifetime.  

You can CommandUtil methods such as `send` in order to send responses.  
With `handleEdits` on, the `send` methods will edit responses accordingly.  
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

### Raw Input

CommandUtil can also be used to view the prefix, command alias, and arguments used.  
The format for command is almost always `<prefix><alias> <arguments>`.  
CommandUtil stores all three of that and more for you.  

```js
const { Command } = require('discord-akairo');

class HelloCommand extends Command {
    constructor() {
        super('hello', {
            aliases: ['hello', 'hi', 'konnichiha', 'bonjour', 'heyo']
        });
    }

    exec(message) {
        if (message.util.parsed.alias === 'konnichiha') {
            return message.util.send('こんにちは！');
        }

        if (message.util.parsed.alias === 'bonjour') {
            return message.util.send('Bonjour!');
        }

        return message.util.send('Hello!');
    }
}

module.exports = HelloCommand;
```

With that, you can see which alias was used by the user.  

You can see the prefix as well.  
For example, if you have two prefixes, `?` and `!`, `message.util.parsed.prefix` will be either `?` or `!`.  
The content can also be viewed, for example, in `!command xyz abc`, `message.util.parsed.content` would be `xyz abc`.  

CommandUtil, if enabled, is available on all messages just after built-in pre-inhibitors.  
This means an invalid input, e.g. `?not-a-command` will still be parsed with prefix of `?` and alias of `not-a-command`.  

### Stored Messages

If you set the command handler option `storeMessages` to true, CommandUtil instances will start storing messages from prompts.  
This means that prompts from the client as well as the user replies are stored within `message.util.messages`.  
See the prompting sections under Arguments for more information about prompts. 
