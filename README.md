<p align="center"><a href=https://github.com/1Computer1/discord-akairo><img src="https://a.safe.moe/PwUgW.png"/></a></p><p align="center"><a href=https://www.npmjs.com/package/discord-akairo><img src="https://img.shields.io/npm/v/discord-akairo.svg?maxAge=3600"/></a> <a href=https://david-dm.org/1computer1/discord-akairo><img src="https://david-dm.org/1computer1/discord-akairo.svg"/></a> <a href=https://travis-ci.org/1Computer1/discord-akairo><img src="https://travis-ci.org/1Computer1/discord-akairo.svg?branch=indev"/></a></p><p align="center"><a href=https://nodei.co/npm/discord-akairo><img src="https://nodei.co/npm/discord-akairo.png?downloads=true"/></a></p><p align="center">A modular and highly customizable bot framework for Discord.js v11.</p>

## Example

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

#### Completely modular commands, inhibitors, and listeners.

  - Reading files recursively from directories.
  - Adding, removing, and reloading modules.
  - Categorization for modules.
  - Works with both object and class export.
  - Almost everything is optional or modifiable.
  - Creating your own handlers and module types.

#### Flexible command handling and creation.

  - Command aliases.
  - Command cooldowns.
  - Running commands on edits and editing previous responses.
  - A dynamic command prefixing system.
    - Multiple prefixes.
    - Variable prefixes per message.
    - Overwriting prefixes for commands.
    - Using mentions as a prefix.
  - Different ways to trigger a command.
    - Regular expression triggers.
    - Conditional triggers.
    - From somewhere else in the bot.

#### Complex and highly customizable arguments.

  - Support for quoted arguments.
  - Arguments based on previous arguments.
  - Several ways to match arguments, such as flag arguments.
  - Casting input into certain types.
    - Simple types such as string, integer, float, url, date, etc.
    - Discord-related types such as user, member, message, etc.
    - Including plural forms: users, members, etc.
    - Types that you can add yourself.
    - Allows for asynchronous type casting.
  - Argument prompting.
    - Can also be based on previous arguments.
    - Customizable prompts with embeds, files, etc.
    - Infinite argument prompting.

#### Blocking and monitoring messages with inhibitors.

  - Allows for asynchronous execution.
  - Run at various stages of command handling.
    - On all messages.
    - On messages that are from valid users.
    - On messages before commands.

#### Modular listeners.

  - No more gigantic main files with listeners.
  - Adding your own emitters.

#### Useful utility methods available.

  - Resolvers for members, users, and others that can filter by name.
  - Shortcut methods for making embeds and collections.
  - Helper methods for prompting users for input.
  - And some other useful things.

#### Support for SQLite.

  - Default values for keys.
  - In-memory caching for stored data.
  - Sanitizing inputs and desanitizing outputs.
  - Parsing or stringifying as JSON.

## Installation

Requires Node 6 or higher and Discord.js 11.0.0 or higher.  

*discord-akairo*  
`npm install --save discord-akairo`

*discord.js*  
`npm install --save discord.js`

*sqlite (optional)*  
`npm install --save sqlite`

## Links

Repository: [https://github.com/1Computer1/discord-akairo](https://github.com/1Computer1/discord-akairo).  
Changelog: [https://github.com/1Computer1/discord-akairo/releases](https://github.com/1Computer1/discord-akairo/releases).  
Documentation: [https://1computer1.github.io/discord-akairo](https://1computer1.github.io/discord-akairo/).  
If you need more help, message me: **1Computer#7952**.  

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
11. [Advanced Args and Prompts](https://1computer1.github.io/discord-akairo/tutorial-11.%20Advanced%20Args%20and%20Prompts.html)
12. [Other Things](https://1computer1.github.io/discord-akairo/tutorial-12.%20Other%20Things.html)

## Contributing

Open an issue or a pull request!  
Everyone is welcome to do so.  
Make sure to run `npm run lint` before committing.  
