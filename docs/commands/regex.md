# Regex Commands

### Memes

Regex or regular expressions, is basically a way to match characters in a string.  
Commands can be triggered with regular expressions using the `trigger` option.  
Multiple regex commands/conditional can be triggered from one message.  

```js
const { Command } = require('discord-akairo');

class AyyCommand extends Command {
    constructor() {
        super('ayy', {
            trigger: /^ayy$/i
        });
    }

    exec(message, match, groups) {
        return message.reply('lmao');
    }
}

module.exports = AyyCommand;
```

This command will trigger on any message with the content `ayy`, case-insensitive.  
The `match` parameter will be the result from `message.content.match(/^ayy$/i)`.  
The `groups` parameter will be the matched groups, if using a global regex.  

### As a Function

The `trigger` option can also be a function.  

```js
const { Command } = require('discord-akairo');

class AyyCommand extends Command {
    constructor() {
        super('ayy', {
            category: 'random'
        });
    }

    trigger(message) {
        // Do some code...
        return /^ayy$/i;
    }

    exec(message, match, groups) {
        return message.reply('lmao');
    }
}

module.exports = AyyCommand;
```
