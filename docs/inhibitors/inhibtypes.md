# Inhibitor Types

### More Coverage

Right now, your inhibitors only runs before a command.  
They do not actually run on all messages.  

To change that, change the `type` option.  

```js
const { Inhibitor } = require('discord-akairo');

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super('blacklist', {
            reason: 'blacklist',
            type: 'all'
        })
    }

    exec(message) {
        // Still a meanie!
        const blacklist = ['81440962496172032'];
        return blacklist.includes(message.author.id);
    }
}

module.exports = BlacklistInhibitor;
```

There are three types:  

- `all` is run on all messages.
- `pre` is run on messages not blocked by `all` and built-in inhibitors.
- `post` (the default) is run on messages before commands, not blocked by the previous.

The built-in inhibitors (don't worry about their names just yet) are:  

- `notSelf` blocks everyone else for selfbots.
- `client` blocks the client (itself) for non-selfbots.
- `bot` blocks all other bots.
- `owner` blocks non-owners from using owner-only commands.
- `guild` blocks guild-only commands used in DMs.
- `dm` blocks DM-only commands used in guilds.
- `clientPermissions` blocks commands used where the client does not have permissions.
- `userPermissions` blocks commands used where the user does not have permissions.

To make it easier to visualize, here is the order:  

- `all` type inhibitors.
- `notSelf`, `client`, and `bot`.
- `pre` type inhibitors.
- `owner`, `guild`, `dm`, `clientPermissions`, and `userPermissions`.
- `post` type inhibitors.
