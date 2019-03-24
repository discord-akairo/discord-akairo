# Argument Types

### Basic Types

As seen in the previous tutorials, there was the `type` option for type casting.  
You've only seen the type `number`, so here are the rest of them:  

- `string` (default)
    - This type does not do anything.
- `lowercase`
    - Transform input to all lowercase.
- `uppercase`
    - Transform input to all uppercase.
- `charCodes`
    - Transform the input to an array of char codes.
- `number`
    - Casts to a number.
- `integer`
    - Casts to a integer.
- `bigint`
    - Casts to a big integer.
- `url`
    - Parses to an URL object.
- `date`
    - Parses to a Date object.
- `color`
    - Parses a hex code to an color integer.
- `commandAlias`
    - Finds a command by alias.
- `command`
    - Finds a command by ID.
- `inhibitor`
    - Finds an inhibitor by ID.
- `listener`
    - Finds a listener by ID.

### Discord Types

Of course, since this is a framework for Discord.js, there are Discord-related types.  

- `user`
    - Resolves a user from the client's collection.
- `member`
    - Resolves a member from the guild's collection.
- `relevant`
    - Resolves a user from the relevant place.
    - Works in both guilds and DMs.
- `channel`
    - Resolves a channel from the guild's collection.
- `textChannel`
    - Resolves a text channel from the guild's collection.
- `voiceChannel`
    - Resolves a voice channel from the guild's collection.
- `role`
    - Resolves a role from the guild's collection.
- `emoji`
    - Resolves an emoji from the guild's collection.
- `guild`
    - Resolves a guild from the client's collection.

All of the above types also have plural forms.  
So if you do `users` instead of `user`, you will receive a Collection of resolved users.  
The types below are also Discord-related, but have no plural form.  

- `message`
    - Fetches a message from an ID within the channel.
- `guildMessage`
    - Fetches a message from an ID within the guild.
- `invite`
    - Fetches an invite from a link.
- `userMention`
    - Matches the user from a mention.
- `memberMention`
    - Matches the member from a mention.
- `channelMention`
    - Matches the channel from a mention.
- `roleMention`
    - Matches the role from a mention.
- `emojiMention`
    - Matches the emoji from a mention.

### Array Types

There are other ways to do type-casting instead of a string literal too.  
The first way is with an array:  

```js
const { Command } = require('discord-akairo');

class PokemonCommand extends Command {
    constructor() {
        super('pokemon', {
            aliases: ['pokemon'],
            args: [
                {
                    id: 'option',
                    type: ['grass', 'fire', 'water', 'electric'],
                    default: 'electric'
                }
            ]
        });
    }

    exec(message, args) {
        if (args.option === 'grass') return message.reply('bulbasaur');
        if (args.option === 'fire') return message.reply('charmander');
        if (args.option === 'water') return message.reply('squirtle');
        if (args.option === 'electric') return message.reply('pikachu');
    }
}

module.exports = PokemonCommand;
```

With the above, the user can only enter one of the entries in the array.  
It is also case-insensitive for input, but not for output.  
This means that if the array was `['GrasS', 'FIrE']` and the input was `grass`, you will get `GrasS`.  

You can also do aliases with the array type like so:  

```js
const { Command } = require('discord-akairo');

class PokemonCommand extends Command {
    constructor() {
        super('pokemon', {
            aliases: ['pokemon'],
            args: [
                {
                    id: 'option',
                    type: [
                        ['grass', 'leaf', 'green'],
                        ['fire', 'red'],
                        ['water', 'blue'],
                        ['electric', 'electricity', 'lightning', 'yellow']
                    ],
                    default: 'electric'
                }
            ]
        });
    }

    exec(message, args) {
        if (args.option === 'grass') return message.reply('bulbasaur');
        if (args.option === 'fire') return message.reply('charmander');
        if (args.option === 'water') return message.reply('squirtle');
        if (args.option === 'electric') return message.reply('pikachu');
    }
}

module.exports = PokemonCommand;
```

If the user inputs anything from the arrays, the first entry will be used.  
So, the input of `leaf` will give you `grass`, `blue` will give you `water`, etc.  

### Regex Types

You can also use a regular expression as a type.  

```js
const { Command } = require('discord-akairo');

class AskCommand extends Command {
    constructor() {
        super('ask', {
            aliases: ['ask'],
            args: [
                {
                    id: 'yesOrNo',
                    type: /^(yes|no)$/i
                }
            ]
        });
    }

    exec(message, args) {
        // {
        //   match: [...],
        //   matches: null
        // }
        console.log(args.yesOrNo);
    }
}

module.exports = AskCommand;
```

This will match `yes` or `no`, case-insensitive and `args.yesOrNo` will give you the result from `word.match(/^(yes|no)$/i`.  
If using a global regex, the `matches` property will be filled for the matches.   
