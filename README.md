<div align="center">
  <br />
  <p>
    <a href="https://discord-akairo.github.io"><img src="https://discord-akairo.github.io/static/logo.svg" width="546" alt="discord-akairo" /></a>
  </p>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/discord-akairo"><img src="https://img.shields.io/npm/v/discord-akairo.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/discord-akairo"><img src="https://img.shields.io/npm/dt/discord-akairo.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://travis-ci.org/discord-akairo/discord-akairo"><img src="https://travis-ci.org/discord-akairo/discord-akairo.svg" alt="Build status" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/discord-akairo/"><img src="https://nodei.co/npm/discord-akairo.png?downloads=true" alt="npm installnfo" /></a>
  </p>
</div>

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
  - Working with both object and class export.
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
    - Asynchronous type casting.
  - Argument prompting.
    - Can also be based on previous arguments.
    - Customizable prompts with embeds, files, etc.
    - Infinite argument prompting.

#### Blocking and monitoring messages with inhibitors.

  - Asynchronous execution.
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

#### Database providers.

  - Built-in support for `sqlite` and `sequelize`.
    - Works on entire table or single JSON column.
  - Caching data from databases.
  - Default values.

## Installation

Requires Node 6 or higher and Discord.js 11.4 or higher.  

*discord-akairo*  
`npm install discord-akairo`

*discord.js*  
`npm install discord.js`

*sqlite (optional)*  
`npm install sqlite`

*sequelize (optional)*  
`npm install sequelize`

## Links

- [Website](https://discord-akairo.github.io)
- [Repository](https://github.com/discord-akairo/discord-akairo)  
- [Changelog](https://github.com/discord-akairo/discord-akairo/releases)
- [Discord](https://discord.gg/arTauDY)  

## Contributing

Open an issue or a pull request!  
Everyone is welcome to do so.  
Make sure to run `npm run lint` before committing.  
