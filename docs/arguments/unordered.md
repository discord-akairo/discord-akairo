# Unordered Arguments

### Any Order!

Arguments can be made to be unordered.  
For example, if you want a command where the arguments are a role and a member in any order:  

```js
const { Command } = require('discord-akairo');

class AddRoleCommand extends Command {
    constructor() {
        super('addrole', {
            aliases: ['addrole'],
            args: [
                {
                    id: 'member',
                    type: 'member',
                    unordered: true
                },
                {
                    id: 'role',
                    type: 'role',
                    unordered: true
                }
            ],
            userPermissions: ['ADMINISTRATOR'],
            channel: 'guild'
        });
    }

    async exec(message, args) {
        await args.member.roles.add(args.role);
        return message.reply('Done!');
    }
}

module.exports = AddRoleCommand;
```

The above command would work as `!addrole member role` and `!addrole role member`.  
No phrase will be parsed twice, for example, if the first phrase matched as a member, the role argument will ignore the first phrase and start with the second.  

Only the match type `phrase` (which is by default) works with the `unordered` option.  
Other match types will ignore this behavior.  

To choose a index to be unordered from (e.g. from the second phrase onwards) use a number, e.g. `unordered: 1`.  
To choose specific indices to be unordered on, use an array, e.g. `unordered: [0, 1, 2]`.  

### With Defaults or Prompts

Unordered arguments have a slightly different behavior when used with a default value and/or a prompt.  

If an unordered argument has a default and nothing matches, the default is used.  
If there is a prompt and nothing matches:  
  - If the prompt is optional, the default value is used.  
  - If not, the prompt is started as if no input was given.  

So, if you do have a prompt, make sure the `optional` option is not used or else it will prompt not at all.  
