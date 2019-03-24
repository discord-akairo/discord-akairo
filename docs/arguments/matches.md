# Matching Input

### Entire Content

Let's say you have a command that picks from a list inputted.  
Obviously, you won't know how many things there are.  
So, we need a different way of matching input instead of word by word.  

```js
const { Command } = require('discord-akairo');

class PickCommand extends Command {
    constructor() {
        super('pick', {
            aliases: ['pick'],
            args: [
                {
                    // Only takes one word!
                    id: 'items'
                }
            ]
        });
    }

    exec(message, args) {
        const picked = args.items; // ???
        return message.reply(`I picked ${picked}`);
    }
}

module.exports = PickCommand;
```

To remedy this, we will use the `match` option.  

```js
const { Command } = require('discord-akairo');

class PickCommand extends Command {
    constructor() {
        super('pick', {
            aliases: ['pick'],
            args: [
                {
                    id: 'items',
                    match: 'content'
                }
            ]
        });
    }

    exec(message, args) {
        const items = args.items.split('|');
        const picked = items[Math.floor(Math.random() * items.length)]
        return message.reply(`I picked ${picked.trim()}!`);
    }
}

module.exports = PickCommand;
```

Now, the entire content, excluding the prefix and command of course, is matched. 

### Flags

If you had a command with lots of argument that can be true or false, you may forget the order.  
This is where `flag` match comes in handy.  

Here is a command where the user can change the output with a flag:  

```js
const { Command } = require('discord-akairo');
const exampleAPI = require('example-api');

class StatsCommand extends Command {
    constructor() {
        super('stats', {
            aliases: ['stats'],
            args: [
                {
                    id: 'username'
                },
                {
                    id: 'advanced',
                    match: 'flag',
                    prefix: '--advanced'
                }
            ]
        });
    }

    exec(message, args) {
        const user = exampleAPI.getUser(args.username);

        if (args.advanced) {
            return message.reply(user.advancedInfo);
        }

        return message.reply(user.basicInfo);
    }
}

module.exports = StatsCommand;
```

Now, if a user does `?stats 1Computer` they will get the `basicInfo`, but if they do `?stats 1Computer --advanced`, they will get the `advancedInfo`.  
It can be out of order too, so `?stats --advanced 1Computer` will work.  

### Prefix

The above example shows `flag`, which does only a boolean value, there or not there.  
Here, we will use `prefix` for unordered input.  

Similar to the above example, but this time, we have many different possibilities.  

```js
const { Command } = require('discord-akairo');
const exampleAPI = require('example-api');

class StatsCommand extends Command {
    constructor() {
        super('stats', {
            aliases: ['stats'],
            args: [
                {
                    id: 'username'
                },
                {
                    id: 'color',
                    match: 'prefix',
                    prefix: '--color=',
                    default: 'red'
                }
            ]
        });
    }

    exec(message, args) {
        const team = exampleAPI.getTeam(args.color);
        const user = team.getUser(args.username);
        
        return message.reply(user.info);
    }
}

module.exports = StatsCommand;
```

So now, all of these inputs can be valid:  

- `?stats 1Computer`
- `?stats 1Computer --color=blue`
- `?stats --color=green 1Computer`

If you would like to use multiple flags or prefixes, you can use an array.  
So, if you did `prefix: ['--color=', '--colour=']`, both will be valid for the user.  

### Quoted and Sticky

Remember `quoted` and `sticky`?  
This is where the difference is important.  

With the input `?stats 1Computer --color="light blue"`:  

- `quoted` gives us `{ username: '1Computer', color: '"light' }`.
- `sticky` gives us `{ username: '1Computer', color: 'light blue' }`.

Use the one that fits for what you are doing!  

### Other Match Types

Here are some other match types that may be useful.  

- `word` (default) matches word by word.
- `rest` matches the rest of the content, minus things matched by `prefix` and `flag`.
- `flag` matches a flag.
- `prefix` matches a flag with additional input.
- `content` matches the content.
- `text` matches the content, minus things matched by `prefix` and `flag`.
- `none` matches nothing at all.
