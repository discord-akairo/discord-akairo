[![logo](./da.png)](https://github.com/1Computer1/discord-akairo)

A modular and highly customizable bot framework for Discord.js v12.

[![npm](https://nodei.co/npm/discord-akairo.png?downloads=true)](https://nodei.co/npm/discord-akairo)

[![deps](https://david-dm.org/1computer1/discord-akairo.svg)](https://david-dm.org/1computer1/discord-akairo)
[![travis](https://travis-ci.org/1Computer1/discord-akairo.svg?branch=master)](https://travis-ci.org/1Computer1/discord-akairo)

-----

## Features

#### Completely modular commands, inhibitors, and listeners.

  - Reading files recursively from directories.
  - Adding, removing, and reloading modules.
  - Creating your own handlers and module types.

#### Flexible command handling and creation.

  - Command aliases.
  - Command throttling and cooldowns.
  - Client and user permission checks.
  - Running commands on edits and editing previous responses.
  - Multiple prefixes and mention prefixes.
  - Regular expression and conditional triggers.

#### Complex and highly customizable arguments.

  - Support for quoted arguments.
  - Arguments based on previous arguments.
  - Several ways to match arguments, such as flag arguments.
  - Casting input into certain types.
    - Simple types such as string, integer, float, url, date, etc.
    - Discord-related types such as user, member, message, etc.
    - Types that you can add yourself.
    - Asynchronous type casting.
  - Prompting for input for arguments.
    - Customizable prompts with embeds, files, etc.
    - Easily include dynamic data such as the incorrect input.
    - Infinite argument prompting.

#### Blocking and monitoring messages with inhibitors.

  - Run at various stages of command handling.
    - On all messages.
    - On messages that are from valid users.
    - On messages before commands.

#### Helpful events and modular listeners.

  - Events for handlers, such as loading modules.
  - Events for various stages of command handling.
  - Reloadable listeners to easily separate your event handling.

#### Useful utilities and database providers.

  - Resolvers for members, users, and others that can filter by name.
  - Shortcut methods for making embeds and collections.
  - Simple to use database providers.
    - Built-in support for `sqlite` and `sequelize`.
    - Works on entire table or single JSON column.
    - Caching data from databases.

## Installation

Requires Node 10 and Discord.js v12.  

*discord-akairo*  
`npm install discord-akairo`

*discord.js*  
`npm install discord.js`

*sqlite (optional)*  
`npm install sqlite`

*sequelize (optional)*  
`npm install sequelize`

## Links

- [Repository](https://github.com/1Computer1/discord-akairo)  
- [Changelog](https://github.com/1Computer1/discord-akairo/releases)  
- [Documentation](https://1computer1.github.io/discord-akairo/) ([master](https://1computer1.github.io/discord-akairo/master))  
- [Tutorials](https://github.com/1Computer1/discord-akairo-guides/tree/stable) ([master](https://github.com/1Computer1/discord-akairo-guides/))  
- [Discord Server](https://discord.gg/arTauDY)  

## Contributing

Open an issue or a pull request!  
Everyone is welcome to do so.  
Make sure to run `npm test` before committing.  
