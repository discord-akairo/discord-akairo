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
            channel: 'guild'
        });
    }

    async exec(message, args) {
        if (!args.member) {
            return message.reply('No member found with that name.');    
        }

        await args.member.ban();
        return message.reply(`${args.member} was banned!`);
    }
}

module.exports = BanCommand;
```

This now checks for the required permissions for the client, then the user.  
When blocked, it emits `missingPermissions` on the command handler.  
It will pass the message, command, either `client` or `user`, then the missing permissions.  

### Dynamic Permissions

Sometimes, you may want to check for a role instead of permission flags.  
This means you can use a function instead of an array!  
A function can be used on both `clientPermissions` and `userPermissions`.  

The return value is the `missing` parameter that is sent to the `missingPermissions` event.  
If the return value is null, then that means they're not missing anything.  

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
            channel: 'guild'
        });
    }

    userPermissions(message) {
        if (!message.member.roles.cache.some(role => role.name === 'Moderator')) {
            return 'Moderator';
        }

        return null;
    }

    async exec(message, args) {
        if (!args.member) {
            return message.reply('No member found with that name.');    
        }

        await args.member.ban();
        return message.reply(`${args.member} was banned!`);
    }
}

module.exports = BanCommand;
```
