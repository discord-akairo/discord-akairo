# Matching Input

### Entire Content

Let's say you have a command that picks from a list inputted.  
Obviously, you won't know how many things there are.  
So, we need a different way of matching input instead of phrase by phrase.  

```js
const { Command } = require('discord-akairo');

class PickCommand extends Command {
    constructor() {
        super('pick', {
            aliases: ['pick'],
            args: [
                {
                    // Only takes one phrase!
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
                    flag: '--advanced'
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

### Option Flag

The above example shows `flag`, which does only a boolean value, there or not there.  
Here, we will use `option` for unordered input.  

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
                    match: 'option',
                    flag: 'color:',
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
- `?stats 1Computer color:blue`
- `?stats color:green 1Computer`

It's also whitespace insensitive between the flag and the input:  

- `?stats 1Computer color: blue`
- `?stats color: green 1Computer`

If you would like to use multiple flags, you can use an array.  
So, if you did `prefix: ['color:', 'colour:']`, both will be valid for the user.  

Note that for both flag match type, you can have flags with whitespace or using an empty string.  
It will work, but will be extremely weird for the end users, so don't do it!  

### Separate

Let's say that we want our pick command to only work on numbers.    
This would mean having to deal with splitting then casting the types within the args!  
We can do this with a custom separator using `separator` option alongside the `separate` match.  

```js
const { Command } = require('discord-akairo');

class PickCommand extends Command {
    constructor() {
        super('pick', {
            aliases: ['pick'],
            separator: '|',
            args: [
                {
                    id: 'items',
                    match: 'separate',
                    type: 'number'
                }
            ]
        });
    }

    exec(message, args) {
        const picked = args.items[Math.floor(Math.random() * args.items.length)]
        return message.reply(`I picked ${picked} which is ${picked % 2 === 0 ? 'even' : 'odd'}!`);
    }
}

module.exports = PickCommand;
``` 

The `separate` match matches the phrases individually into an array where each element is type casted one by one.  
The `separator` option simply makes it so that all the input is separated via a certain character rather than by whitespace.  

Note that with the `separator` option, quotes will not work.  
Flags will also have to be contained individually:  

- `!foo a, --flag, c` recognizes `--flag`
- `!foo a, x --flag y, c` does not
- `!foo a, --option y, c` recognizes `--option`
- `!foo a, x --option y, c` does not

### Summary

Here are all the match types available in Akairo.  

- `phrase` (default) matches one by one (where a phrase is either a word or something in quotes).
- `rest` matches the rest of the content, minus things matched by `flag` and `option`.
- `separate` matches the same way as `rest`, but works on each phrase separately.
- `flag` matches a flag.
- `option` matches a flag with additional input.
- `content` matches the content.
- `text` matches the content, minus things matched by `flag` and `option`.
- `none` matches nothing at all.

The different match types have the following behavior with border whitespaces, quotes, and separators:  
- `phrase`, `separate`, and `option` do not preserve any of the three.  
- `rest`, `content`, `text` do preserve all three.  
