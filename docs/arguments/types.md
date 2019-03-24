# Argument Types

### Basic Types

As seen in the previous tutorials, there was the `type` option for type casting.  
You've only seen the type `number`, so here are the rest of them:  

- `string` (default)
    - This type does not do anything.
    - Fails if there was no input.
- `lowercase`
    - Transform input to all lowercase.
    - Fails if there was no input.
- `uppercase`
    - Transform input to all uppercase.
    - Fails if there was no input.
- `charCodes`
    - Transform the input to an array of char codes.
    - Fails if there was no input.
- `number`
    - Casts to a number.
    - Fails if input is not a number.
- `integer`
    - Casts to a integer.
    - Fails if input is not a number.
- `dynamic`
    - Casts to a number.
    - If not a number, does the same as `string`.
- `dynamicInt`
    - Casts to a integer.
    - If not a number, does the same as `string`.
- `url`
    - Parses to an URL object.
    - Fails if not a valid URL.
- `date`
    - Parses to a Date object.
    - Fails if not a valid date.
- `color`
    - Parses a hex code to an color integer.
    - Fails if invalid color.
- `commandAlias`
    - Finds a command by alias.
    - Fails if alias does not exist.
- `command`
    - Finds a command by ID.
    - Fails if no command with that ID.
- `inhibitor`
    - Finds an inhibitor by ID.
    - Fails if no inhibitor with that ID.
- `listener`
    - Finds a listener by ID.
    - Fails if no listener with that ID.

### Discord Types

Of course, since this is a framework for Discord.js, there are Discord-related types.  

- `user`
    - Resolves a user from the client's collection.
    - Fails if it cannot find one.
- `member`
    - Resolves a member from the guild's collection.
    - Fails if it cannot find one.
- `relevant`
    - Resolves a user from the relevant place.
    - Works in both guilds and DMs.
    - Fails if it cannot find one.
- `channel`
    - Resolves a channel from the guild's collection.
    - Fails if it cannot find one.
- `textChannel`
    - Resolves a text channel from the guild's collection.
    - Fails if it cannot find one.
- `voiceChannel`
    - Resolves a voice channel from the guild's collection.
    - Fails if it cannot find one.
- `role`
    - Resolves a role from the guild's collection.
    - Fails if it cannot find one.
- `emoji`
    - Resolves an emoji from the guild's collection.
    - Fails if it cannot find one.
- `guild`
    - Resolves a guild from the client's collection.
    - Fails if it cannot find one.

All of the above types also have plural forms.  
So if you do `users` instead of `user`, you will receive a Collection of resolved users.  
The types below are also Discord-related, but have no plural form.  

- `message`
    - Fetches a message from an ID.
    - Fails if the fetching errored or message was not found.
- `invite`
    - Resolves an invite code from a link.
    - Fails if no code could be resolved.
- `memberMention`
    - Matches the member from a mention.
    - Fails if there are no members with the mention's ID.
- `channelMention`
    - Matches the channel from a mention.
    - Fails if there are no channels with the mention's ID.
- `roleMention`
    - Matches the role from a mention.
    - Fails if there are no roles with the mention's ID.
- `emojiMention`
    - Matches the emoji from a mention.
    - Fails if there are no emojis with the mention's ID.
    
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
        //   groups: null
        // }
        console.log(args.yesOrNo);
    }
}

module.exports = AskCommand;
```

This will match `yes` or `no`, case-insensitive and `args.yesOrNo` will give you the result from `word.match(/^(yes|no)$/i`.  
If using a global regex, the `groups` property will be filled for matched groups.   
