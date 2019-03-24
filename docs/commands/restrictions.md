# Restrictions

### Channel Restrictions

If a command requires a guild to be used correctly, you can restrict it to a guild with one option.  

```js
const { Command } = require('discord-akairo');

class NicknameCommand extends Command {
    constructor() {
        super('nickname', {
            aliases: ['nickname']
        });
    }

    exec(message) {
        return message.reply(`Your nickname is ${message.member.nickname}.`);
    }
}

module.exports = NicknameCommand;
```

The above breaks in a DM, so let's add the `channel` option.  

```js
const { Command } = require('discord-akairo');

class NicknameCommand extends Command {
    constructor() {
        super('nickname', {
            aliases: ['nickname'],
            channel: 'guild'
        });
    }

    exec(message) {
        return message.reply(`Your nickname is ${message.member.nickname}.`);
    }
}

module.exports = NicknameCommand;
```

Everything is fixed and you can go on your way!  
As a bonus, this will emit `commandBlocked` on the command handler with the reason `guild` if someone tries to use it in a DM.  

### Owner Only

Remember the `ownerID` option in your client?  
Your commands can be owner-only, restricting them to be used by the owner(s).  
Simply add `ownerOnly`.  

```js
const { Command } = require('discord-akairo');

class TokenCommand extends Command {
    constructor() {
        super('token', {
            aliases: ['token'],
            ownerOnly: true,
            channel: 'dm'
        });
    }

    exec(message) {
        // Don't actually do this.
        return message.reply(this.client.token);
    }
}

module.exports = TokenCommand;
```

This will emit `commandBlocked` with the reason `owner` if someone else uses it.  
