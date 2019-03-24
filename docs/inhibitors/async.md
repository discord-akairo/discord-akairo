# Async Execution

### Promises

Some inhibitors may require the use of Promises to work.  

```js
const { Inhibitor } = require('discord-akairo');
const exampleAPI = require('example-api');

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super('gameBlacklist', {
            reason: 'gameBlacklist'
        });
    }

    exec(message, command) {
        if (command.category.id !== 'games') return false;
        return exampleAPI.fetchInfo(message.author.id).then(info => {
            if (info.isBad) return Promise.reject();
            return Promise.resolve();
        });
    }
}

module.exports = BlacklistInhibitor;
```

The difference from outside of a Promise is that in order to block, you must reject.  
Anything else is considered not a block.  

### Async / Await

Since Discord.js and Akairo runs on Promises, async/await is possible.  
The above with async/await would look like this:  

```js
const { Inhibitor } = require('discord-akairo');
const exampleAPI = require('example-api');

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super('gameBlacklist', {
            reason: 'gameBlacklist'
        });
    }

    async exec(message, command) {
        if (command.category.id !== 'games') return Promise.resolve();
        const info = await exampleAPI.fetchInfo(message.author.id);

        if (info.isBad) return Promise.reject();
        return Promise.resolve();
    }
}

module.exports = BlacklistInhibitor;
```
