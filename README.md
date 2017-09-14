<p align="center"><a href=https://github.com/1Computer1/discord-akairo><img src="https://a.safe.moe/PwUgW.png"/></a></p><p align="center"><a href=https://www.npmjs.com/package/discord-akairo><img src="https://img.shields.io/npm/v/discord-akairo.svg?maxAge=3600"/></a> <a href=https://david-dm.org/1computer1/discord-akairo><img src="https://david-dm.org/1computer1/discord-akairo.svg"/></a> <a href=https://travis-ci.org/1Computer1/discord-akairo><img src="https://travis-ci.org/1Computer1/discord-akairo.svg?branch=indev"/></a></p><p align="center"><a href=https://nodei.co/npm/discord-akairo><img src="https://nodei.co/npm/discord-akairo.png?downloads=true"/></a></p><p align="center">A modular and highly customizable bot framework for Discord.js v12</p>

## Examples

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '!',
    allowMentions: true,
    commandDirectory: './src/commands/',
    inhibitorDirectory: './src/inhibitors/',
    listenerDirectory: './src/listeners/'
});

client.login('TOKEN').then(() => {
    console.log('Started up!');
});
```

```js
const { Command } = require('discord-akairo');

class BanCommand extends Command {
    constructor() {
        super('ban', {
            aliases: ['ban'],
            channel: 'guild',
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            args: [
                {
                    id: 'member',
                    type: 'member',
                    prompt: {
                        start: 'Who would you like to ban?',
                        retry: 'Please input a valid user!'
                    }
                }
            ]
        });
    }

    async exec(message, { member }) {
        if (member.bannable) {
            await member.ban();
            return message.reply(`I have banned ${member}!`);
        }
        
        return message.reply(`I cannot ban ${member}!`);
    }
}

module.exports = BanCommand;
```

## Features

#### Completely modular commands, inhibitors, and listeners.

  - Reading files recursively from directories.
  - Adding, removing, and reloading modules.
  - Categorization for modules.
  - Almost everything is optional or modifiable.
  - Creating your own handlers and module types.

#### Flexible command handling and creation.

  - Command aliases.
  - Command throttling and cooldowns.
  - Client and user permission checks.
  - Running commands on edits and editing previous responses.
  - A dynamic command prefixing system.
    - Multiple prefixes and mention prefixes.
    - Overwriting prefixes for commands.
  - Different ways to trigger a command.
    - Regular expression and conditional triggers.
    - Programmatically triggering a command.

#### Complex and highly customizable arguments.

  - Support for quoted arguments.
  - Arguments based on previous arguments.
  - Argument swapping and command cancelling.
  - Several ways to match arguments, such as flag arguments.
  - Casting input into certain types.
    - Simple types such as string, integer, float, url, date, etc.
    - Discord-related types such as user, member, message, etc.
    - Including plural forms: users, members, etc.
    - Types that you can add yourself.
    - Asynchronous type casting.
  - Prompting for input for arguments.
    - Customizable prompts with embeds, files, etc.
    - Easily include dynamic data such as the incorrect input.
    - Infinite argument prompting.
    - Can also be based on previous arguments.

#### Blocking and monitoring messages with inhibitors.

  - Asynchronous execution.
  - Run at various stages of command handling.
    - On all messages.
    - On messages that are from valid users.
    - On messages before commands.

#### Helpful events and modular listeners.

  - Events for handlers, such as loading modules.
  - Events for various stages of command handling.
    - For when commands start or finish.
    - For when commands are blocked or cancelled.
  - Modular listeners to easily separate your event handling.
    - Completely reloadable.
    - Adding your own emitters to listen to.

#### Useful utilities and database providers.

  - A utility class with many methods.
    - Resolvers for members, users, and others that can filter by name.
    - Shortcut methods for making embeds and collections.
  - Simple to use database providers.
    - Built-in support for `sqlite` and `sequelize`.
    - Works on entire table or single JSON column.
    - Caching data from databases.
    - Default values.

## Installation

Requires Node 8 and Discord.js v12.  

*discord-akairo*  
`npm install discord-akairo`

*discord.js*  
`npm install discord.js`

*sqlite (optional)*  
`npm install sqlite`

*sequelize (optional)*  
`npm install sequelize`

## Links

Repository: [https://github.com/1Computer1/discord-akairo](https://github.com/1Computer1/discord-akairo).  
Changelog: [https://github.com/1Computer1/discord-akairo/releases](https://github.com/1Computer1/discord-akairo/releases).  
Documentation: [https://1computer1.github.io/discord-akairo](https://1computer1.github.io/discord-akairo/).  
Tutorials: [https://1computer1.gitbooks.io/akairo-tutorials/content](https://1computer1.gitbooks.io/akairo-tutorials/content/).  
Discord Server: [https://discord.gg/arTauDY](https://discord.gg/arTauDY).  

## Contributing

Open an issue or a pull request!  
Everyone is welcome to do so.  
Make sure to run `npm test` before committing.  
