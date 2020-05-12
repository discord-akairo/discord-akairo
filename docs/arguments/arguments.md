# Basic Arguments

### Adding Numbers

Commands should also have some user input, in the form of arguments.  
In Akairo, arguments are the most complex things ever, so this tutorial will only go through the basics.  

Let's make a command that takes three numbers and adds them up.  

```js
const { Command } = require('discord-akairo');

class AddCommand extends Command {
    constructor() {
        super('add', {
            aliases: ['add']
        });
    }

    exec(message) {
        // This doesn't work!
        return message.reply(a + b + c);
    }
}

module.exports = AddCommand;
```

Now we will add arguments in the command options with the `args` option.  
This option must be an array of objects, containing info for parsing.  

```js
const { Command } = require('discord-akairo');

class AddCommand extends Command {
    constructor() {
        super('add', {
            aliases: ['add'],
            args: [
                {
                    id: 'numOne',
                    type: 'number',
                    default: 0
                },
                {
                    id: 'numTwo',
                    type: 'number',
                    default: 0
                },
                {
                    id: 'numThree',
                    type: 'number',
                    default: 0
                }
            ]
        });
    }

    exec(message, args) {
        const sum = args.numOne + args.numTwo + args.numThree;
        return message.reply(`The sum is ${sum}!`);
    }
}

module.exports = AddCommand;
```

Arguments must always have an `id`, it will be what you use to refer to them in `args`.  
The `type` options is optional, but since we want numbers, it is set to `number`.  
The `default` is what is used if there are no input or no number input.  

By default, arguments are able to be quoted (you can disable this by having the `quoted` option set to false).  
So, technically, this works (although it won't be an actual number input): `?add "hello world" 2 3`.  
