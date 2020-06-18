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
        });
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

The built-in inhibitors are:  

- `client` blocks the client (itself).
- `bot` blocks all other bots.
- `owner` blocks non-owners from using owner-only commands.
- `guild` blocks guild-only commands used in DMs.
- `dm` blocks DM-only commands used in guilds.

To make it easier to visualize, here is the order:  

- `all` type inhibitors.
- `client`, and `bot`.
- (commands sent when someone is in the middle of being prompted are blocked here)
- `pre` type inhibitors.
- `owner`, `guild`, and `dm`.
- (commands that have missing permissions are blocked here)
- `post` type inhibitors.
- (commands under cooldown are blocked here)
