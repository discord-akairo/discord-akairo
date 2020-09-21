# Argument Prompting

### Please Try Again

You may notice prompting for arguments in other bots (Tatsumaki) or bot frameworks (Commando).  
Akairo has a flexible way for you to do them too!  
It allows you to set the following properties:  

- How many times the user can retry.
- How long they can stall the prompt for.
- The input to use to cancel a prompt (default is `cancel`).
- Whether or not the prompt is optional.
- The message to send on start, on retry, on timeout, on maximum retries, and on cancel.
    - There can be embeds or files too!
    - Or you can have no message at all!

Let's start with a basic prompt.  
We will be reusing this command:  

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

First, remove the `default`.  
Since prompting will have the user retry until it is finished, `default` won't do anything.  
Now, add the `prompt` property with the options you want.  

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
                        retry: 'That\'s not a valid member! Try again.'
                    }
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

Simple as that, you have a prompt.  
Guess what, you can use a function for those messages too!  

```js
prompt: {
    start: message => `Hey ${message.author}, who would you like to get the highest role of?`,
    retry: message => `That\'s not a valid member! Try again, ${message.author}.`
}
```

More complex structures can also be returned as well.  
This includes embeds, attachments, anything that can be sent.  

```js
prompt: {
    start: message => {
        const embed = new MessageEmbed().setDescription('Please input a member!');
        const content = 'Please!';
        return { embed, content };
    }
}
```

### Cascading

Prompts can also "cascade" from three places: the command handler, then the command, then the argument.  
For the command handler or the command, we would set the `argumentDefaults` option.  

```js
this.commandHandler = new CommandHandler(this, {
    directory: './commands/',
    prefix: '?',
    argumentDefaults: {
        prompt: {
            timeout: 'Time ran out, command has been cancelled.',
            ended: 'Too many retries, command has been cancelled.',
            cancel: 'Command has been cancelled.',
            retries: 4,
            time: 30000
        }
    }
});
```

Those prompt options would now be applied to all prompts that do not have those options already.  
Or, with a command with similar arguments:  

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
                    prompt: true
                },
                {
                    id: 'numTwo',
                    type: 'number',
                    prompt: true
                }
                {
                    id: 'numThree',
                    type: 'number',
                    prompt: true
                }
            ],
            defaultPrompt: {
                start: 'Please input a number!',
                retry: 'Please input a number!'
            }
        });
    }

    exec(message, args) {
        const sum = args.numOne + args.numTwo + args.numThree;
        return message.reply(`The sum is ${sum}!`);
    }
}

module.exports = AddCommand;
```

Rather than repeating the text for all three arguments, there is a default prompt that applies to all three.  
Their `prompt` property still has to be truthy in order to actually prompt, of course.  

### Modifying

Prompts can then be modified with a modify function.  
It is most useful inside the `argumentDefaults` option, such as on the command handler.  

```js
argumentDefaults: {
    prompt: {
        modifyStart: (message, text) => `${text}\nType cancel to cancel this command.`,
        modifyRetry: (message, text) => `${text}\nType cancel to cancel this command.`,
        timeout: 'Time ran out, command has been cancelled.',
        ended: 'Too many retries, command has been cancelled.',
        cancel: 'Command has been cancelled.',
        retries: 4,
        time: 30000
    }
}
```

The options `modifyStart`, `modifyRetry`, etc. are used to modify those types of prompts.  
With the above options, all `start` and `retry` prompts will have "Type cancel to cancel this command." appended after it.  
