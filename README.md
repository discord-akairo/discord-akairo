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

## About
A modular and customizable bot framework for Discord.js v11.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '9876543210',
    prefix: '$',
    commandDirectory: './src/commands/',
    inhibitorDirectory: './src/inhibitors/',
    listenerDirectory: './src/listeners/'
});

client.login('TOKEN').then(() => {
    console.log('Started up!');
});
```

## Features
- Completely modular commands, inhibitors, and listeners.
  - Reads all files from directories.
  - Adding, removing, and loading modules.
  - Categorization for modules.

- Flexible command handling and creation.
  - Command aliases.
  - Command cooldowns.
  - Running commands on edits.
  - A rich command prefixing system.
    - Multiple prefixes and prefix overwrites.
    - Using mentions as a prefix.
  - Different ways to trigger a command.
    - Regular expression triggers.
    - Conditional triggers.

- Complex and highly customizable arguments.
  - Support for quoted arguments.
  - Arguments based on previous arguments.
  - Several ways to match arguments: by word, by flag, etc.
  - Casting input into certain types.
    - Simple types such as string, integer, float, url, date, etc.
    - Discord-related types such as user, member, message, etc.
    - Including plural forms: users, members, etc.
    - Types that you can add yourself.
  - Argument prompting.
    - Customizable prompts with embeds, files, etc.
    - Infinite argument prompting.

- Useful utility methods available.
  - Resolvers for members, users, and others that can filter by name.
  - Shortcut methods for making embeds, collection, and prompting.

- Support for SQLite.
  - Default values for keys.
  - In-memory caching for stored data.
  - Santizing inputs and desanitizing outputs.
  - Parsing or stringifying as JSON.

## Installation
discord-akairo: `npm install discord-akairo --save`  
discord.js: `npm install discord.js --save`  
sqlite (optional): `npm install sqlite --save`  

## Links
Repository is available at [https://github.com/1Computer1/discord-akairo](https://github.com/1Computer1/discord-akairo).  
Changelog is available at [https://github.com/1Computer1/discord-akairo/releases](https://github.com/1Computer1/discord-akairo/releases).  
Documentation is available at [https://1computer1.github.io/discord-akairo](https://1computer1.github.io/discord-akairo/).  
If you need more help, message me on Discord: 1Computer#7952.  

## Tutorials
1. [Setting Up a Bot](https://1computer1.github.io/discord-akairo/tutorial-1.%20Setting%20Up%20a%20Bot.html)
2. [Creating a Command](https://1computer1.github.io/discord-akairo/tutorial-2.%20Creating%20a%20Command.html)
3. [Customizing Commands](https://1computer1.github.io/discord-akairo/tutorial-3.%20Customizing%20Commands.html)
4. [Creating an Inhibitor](https://1computer1.github.io/discord-akairo/tutorial-4.%20Creating%20an%20Inhibitor.html)
5. [Creating a Listener](https://1computer1.github.io/discord-akairo/tutorial-5.%20Creating%20a%20Listener.html)
6. [Storing Data with SQLite](https://1computer1.github.io/discord-akairo/tutorial-6.%20Storing%20Data%20with%20SQLite.html)
7. [Regex and Conditionals](https://1computer1.github.io/discord-akairo/tutorial-7.%20Regex%20and%20Conditionals.html)
8. [Argument Prompting](https://1computer1.github.io/discord-akairo/tutorial-8.%20Argument%20Prompting.html)
9. [Handling Edits](https://1computer1.github.io/discord-akairo/tutorial-9.%20Handling%20Edits.html)
10. [Customizing Types](https://1computer1.github.io/discord-akairo/tutorial-10.%20Customizing%Types.html)
