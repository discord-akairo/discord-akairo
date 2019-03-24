# Conditional Commands

### if (commandIs('conditional', message))

Conditional commands are commands that run if a certain criteria is matched on a message.  
This is done with the `condition` option, which must be a function.  
Multiple conditional commands/regex commands can be triggered on one message.    

```js
const { Command } = require('discord-akairo');

class ComplimentCommand extends Command {
    constructor() {
        super('compliment', {
            category: 'random'
        });
    }

    condition(message) {
        return message.author.id === '126485019500871680';
    }

    exec(message) {
        return message.reply('You are a great person!');
    }
}

module.exports = ComplimentCommand;
```
