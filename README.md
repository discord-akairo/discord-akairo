<p align="center">
    <a href=https://github.com/1Computer1/discord-akairo>
        <img src=https://u.nya.is/fweoqf.png/>
    </a>
</p>  

<p align="center">
    <a href=https://nodei.co/npm/discord-akairo>
        <img src=https://nodei.co/npm/discord-akairo.png/>
    </a>
</p>  

# About
A bot framework for Discord.js v11, where everything is reloadable, commands are easy as cake to make, and argument parsing is very flexible.  

```js
const Discord = require('discord.js');
const Akairo = require('discord-akairo');

const client = new Discord.Client();
const akairo = new Akairo.Framework(client, {
    token: 'TOKEN', 
    ownerID: 'ID', 
    prefix: '!', 
    allowMention: true, 
    commandDirectory: './src/commands/', 
    inhibitorDirectory: './src/inhibitors/',
    listenerDirectory: './src/listeners/'
});

akairo.login().then(() => {
    console.log('Started up!');
});
```

# Installation
discord-akairo: `npm install discord-akairo --save`  
discord.js: `npm install discord.js --save`  
sqlite: `npm install sqlite --save`  

# Documentation
Documentation is available on [https://1computer1.github.io/discord-akairo/index.html](https://1computer1.github.io/discord-akairo/index.html).  
If you need more help, message me on Discord: 1Computer#7952.  

# Examples
### Commands and Arguments
```js
const Command = require('discord-akairo').Command;

function exec(message, args){
    let random = Math.random() * args.limit + 1;
    if (!args.noFloor) random = Math.floor(random);

    message.channel.send(random);
}

module.exports = new Command('roll', ['roll', 'dice', 'rng'], [
    {id: 'limit', type: 'number', defaultValue: 100},
    {id: 'noFloor', parse: 'flag', prefix: '--noFloor'}
], exec, {
    channelRestriction: 'guild'
});
```

### Command Inhibitors
```js
const Inhibitor = require('discord-akairo').Inhibitor;
const blockedUsers = ['1234', '5678', '1357', '2468'];

function exec(message){
    return blockedUsers.includes(message.author.id);
}

module.exports = new Inhibitor('blacklist', 'blacklist', exec);
```

### Event Listeners
```js
const Listener = require('discord-akairo').Listener;

function exec(message, command, reason){
    const replies = {
        owner: 'You are not the bot owner!',
        guild: 'You can only use this command in a guild!',
        dm: 'You can only use this command in a DM!',
        blacklist: 'I don\'t like you >:c'
    };

    if (replies[reason]) message.reply(replies[reason]);
}

module.exports = new Listener('commandBlocked', 'commandHandler', 'commandBlocked', 'on', exec);
```

### Reloading
```js
// Somewhere...
commandHandler.reloadCommand('roll');
commandHandler.reloadInhibitor('blacklist');
listenerHandler.reloadListener('commandBlocked');

// All reloaded!
```

### SQLite Support
```js
const guildSQL = new Akairo.SQLiteHandler('./databases/guilds.sqlite', 'guildConfigs', require('./databases/guildDefault.json'));

akairo.login().then(() => {
    guildSQL.init(client.guilds.map(g => g.id)).then(() => {
        console.log(guildSQL.get('123456').prefix) // Hopefully not '!'
    });
});
```