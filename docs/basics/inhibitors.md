# Basic Inhibitors

### Setup

Inhibitors are a way to monitor or block messages coming into the command handler.  
Because inhibitors are another kind of module, we need another kind of handler.  
To set it up, simply add the `inhibitorDirectory` option to your client.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

### Blacklist

Create a folder named `inhibitors`, then a file there to make one.  
Just like with commands, both an instance export and a class export works.  
But we will keep to an instance export because they are shorter.  

```js
const { Inhibitor } = require('discord-akairo');

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super('blacklist', {
            reason: 'blacklist'
        })
    }

    exec(message) {
        // He's a meanie!
        const blacklist = ['81440962496172032'];
        return blacklist.includes(message.author.id);
    }
}

module.exports = BlacklistInhibitor;
```

The first parameter is the unique ID of the inhibitor.  

The second parameter are the options.  
The option `reason` is what will get emitted to an event, but we can worry about that later.  

The exec method should return either `true`, a promise rejection, or a falsey value.  
If it is not a falsey value, that means the message has been blocked!  
