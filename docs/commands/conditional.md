# Conditional Commands

### Run Whenever

Conditional commands are commands that run if the following conditions are true:  
- The command was not invoked normally.
- The command's `condition` option is true.

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

This command, whenever a certain person sends any message, will execute.  
