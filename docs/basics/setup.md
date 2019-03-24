# Setting Up

### Installation

Before even doing anything else, you of course have to install the Discord.js and Akairo.  

`npm install discord.js`  
`npm install discord-akairo`  

If you feel like working with SQLite or Sequelize later, install that too.  

`npm install sqlite`  
`npm install sequelize`  

Once everything has been installed, your working directory should look something like this:  

```
mybot
|____ node_modules
      bot.js
```

### Main File

Inside `bot.js`, require `discord-akairo` and create your client:  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient();

client.login('TOKEN');
```

There are some options that you may want to use with your client.  
Let's setup the owner, the prefix for commands, and the directory for commands.  
If you would like to have multiple owners or multiple prefixes, simply add those with an array.  
We want to use Discord.js's `disableEveryone` option too.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872', // or ['123992700587343872', '86890631690977280']
    prefix: '?', // or ['?', '!']
    commandDirectory: './commands/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

Now, your folder should look like this:  

```
mybot
|____ node_modules
|____ commands
      bot.js
```

Your bot should now login, and you are ready to make commands.  
