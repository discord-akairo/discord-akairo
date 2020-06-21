# More Prompting

### Optional Prompts

Optional prompts are prompts that run if there was input, but the type casting failed.  
If there was no input, it would go on as normal.  

```js
const { Command } = require('discord-akairo');

class HighestRoleCommand extends Command {
    constructor() {
        super('highestRole', {
            aliases: ['highestRole'],
            args: [
                {
                    id: 'member',
                    type: 'member',
                    prompt: {
                        start: 'Who would you like to get the highest role of?',
                        retry: 'That\'s not a valid member! Try again.',
                        optional: true
                    },
                    default: message => message.member
                }
            ],
            channel: 'guild'
        });
    }

    exec(message, args) {
        return message.reply(args.member.roles.highest.name);
    }
}

module.exports = HighestRoleCommand;
```

With it, `default` is now used again.  

- `?highestRole` would give the name for the message author.
- `?highestRole 1Computer` would give the name for 1Computer.
- `?highestRole someone-non-existant` would start up the prompts.

### Infinite Prompts

Infinite prompts are prompts that go on and on until the user says stop.  
(You can customize the input, but by default it is `stop`.)  

```js
const { Command } = require('discord-akairo');

class PickCommand extends Command {
    constructor() {
        super('pick', {
            aliases: ['pick'],
            args: [
                {
                    id: 'items',
                    match: 'none',
                    prompt: {
                        start: [
                            'What items would you like to pick from?',
                            'Type them in separate messages.',
                            'Type `stop` when you are done.'
                        ],
                        infinite: true
                    }
                }
            ]
        });
    }

    exec(message, args) {
        const picked = args.items[Math.floor(Math.random() * args.items.length)];
        return message.reply(`I picked ${picked.trim()}!`);
    }
}

module.exports = PickCommand;
```

And with that, `args.items` is now an array of responses from the user.  
Note that the `none` match is used, meaning nothing is matched in the original message.  
Because this is an infinite prompt that goes across multiple messages, we don't want it to take input from the original message.  
If you wish to allow a hybrid of matching and prompting multiple phrases, try using `separate` match with infinite prompts.   
