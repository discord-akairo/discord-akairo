# Permissions

### Permission Flags

Some commands should only be used by someone with certain permissions.  
There are options to help you do this.  
The two options to use are `clientPermissions` and `userPermissions`.  

```js
const { Command } = require('discord-akairo');

class BanCommand extends Command {
    constructor() {
        super('ban', {
            aliases: ['ban'],
            args: [
                {
                    id: 'member',
                    type: 'member'
                }
            ],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            channelRestriction: 'guild'
        });
    }

    exec(message, args) {
        if (!args.member) {
            return message.reply('No member found with that name.');    
        }

        return args.member.ban().then(() => {
            return message.reply(`${args.member} was banned!`);
        });
    }
}

module.exports = BanCommand;
```

This now checks for the required permissions for the client, then the user.  
Just like `channelRestriction`, it emits `commandBlocked` on the command handler.  
The reason is either `clientPermissions` or `userPermissions`.  

### Dynamic Permissions

Sometimes, you may want to check for a role instead of permission flags.  
This means you can use a function instead of an array!  
A function can be used on both `clientPermissions` and `userPermissions`.  

```js
const { Command } = require('discord-akairo');

class BanCommand extends Command {
    constructor() {
        super('ban', {
            aliases: ['ban'],
            args: [
                {
                    id: 'member',
                    type: 'member'
                }
            ],
            clientPermissions: ['BAN_MEMBERS'],
            channelRestriction: 'guild'
        });
    }
    
    userPermissions(message) {
        return message.member.roles.exists(role => role.name === 'Moderator');
    }
    
    exec(message, args) {
        if (!args.member) {
            return message.reply('No member found with that name.');    
        }

        return args.member.ban().then(() => {
            return message.reply(`${args.member} was banned!`);
        });
    }
}

module.exports = BanCommand;
```
