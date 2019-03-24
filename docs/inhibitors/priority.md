# Inhibitor Priority

### Me First!

Sometimes multiple inhibitors can block a message.  
For example, you may have an inhibitor for blacklisting within a server, and another for a global blacklist.  
By default, inhibitors are ordered by their load order, which is based on the filename.  
So, if you had named the inhibitors `blacklist.js` and `globalBlacklist.js`, the former would have a higher priority.  
Whenever both inhibitors block a message, the `commandBlocked` event would fire with the blacklist inhibitor's reason.  
If you want the global blacklist inhibitor's instead you can use the `priority` option.  

```js
const { Inhibitor } = require('discord-akairo');
const globalBlacklist = require('something');

class GlobalBlacklistInhibitor extends Inhibitor {
    constructor() {
        super('globalBlacklist', {
            reason: 'globalBlacklist',
            priority: 1
        });
    }

    exec(message) {
        return globalBlacklist.has(message.author.id);
    }
}

module.exports = BlacklistInhibitor;
```

By default, inhibitors have a priority of 0.  
By increasing it, it means that the inhibitor will now have priority over the others.  
So when two inhibitors block a message, the one with the higher priority will be used.  
If they have the same priority, then it is still by load order.  
