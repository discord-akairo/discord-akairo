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
                }
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

### Argument Splitting

A popular feature for bots are quoted arguments.  
By default, arguments are not quoted, but changing it is easy.  
Let's make a command that asks for the name, location, and age.   

```js
const { Command } = require('discord-akairo');

class InfoCommand extends Command {
    constructor() {
        super('info', {
            aliases: ['info'],
            split: 'quoted',
            args: [
                {
                    id: 'name'
                },
                {
                    id: 'location'
                }
                {
                    id: 'age',
                    type: 'number'
                }
            ]
        });
    }

    exec(message, args) {
        return message.reply(`Hi ${args.age} years old ${args.name} from ${args.location}!`);
    }
}

module.exports = InfoCommand;
```

The `split` option determines how arguments are split into words.  
So now, we can input `?info "John Smith" "Somewhere, Earth" 25` and our result will be `Hi 25 years old John Smith from Somewhere, Earth!`.  

Other `split` types are:  

- `plain` (default) splits by whitespace, and whitespace only.
- `split` splits the noob way, using `message.content.split(' ')` and should never be used.
- `quoted` splits by whitespace and double quotes.
- `sticky` splits by whitespace and double quotes, but with some minor changes.
- `none` does not split at all, giving the entire content as one word.

The difference between `quoted` and `sticky` is this:  
Let's take the input `!command 123"hello world" 456`.  

- `quoted` will parse this as `['123', 'hello world', '456']`.  
- `sticky` will parse this as `['123"hello world"', '456']`.  

This may seem weird, but you will see the reason later.  
