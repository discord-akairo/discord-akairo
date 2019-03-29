# Updating to v8

### Breaking Changes

This tutorial is for updating from Akairo v7 to v8.  
Many changes were introduced in v8 so hopefully this guide can help you fix them.  

Not only are there changes within the framework, there are also changes with Discord.js v12.  
You will have to update to Node 10 in order to use the libraries due to new JavaScript features.  

The suggestions below are not an exhaustive list.  
For a full changelog, see [here](https://github.com/discord-akairo/discord-akairo/releases).  

### Renames

Below are renames that will mostly be find-and-replace.  

##### General 

The ClientUtil method `fetchMemberFrom` has been renamed to `fetchMember`.  

##### Commands

The CommandHandler event `commandCooldown` has been renamed to `cooldown`.  

The Command option and property `channelRestriction` has been renamed to just `channel`.  
The Command option and property `trigger` has been renamed to `regex`.  

##### Arguments

The Argument option and property `prefix` has been renamed to `flag`.  
The Argument method `cast` has been renamed to `process`.  

Regex types in arguments e.g. `type: /^text$/` used to evaluate to an object with the property `match` and `groups`.  
This has been replaced with an object with the property `match` and `matches`.  

The match type `word` has been renamed to `phrase`.  
The match type `prefix` has been renamed to `option`.  

The TypeResolver property `handler` has been renamed to `commandHandler`.  

##### Listeners

The Listener option and property `eventName` has been renamed to just `event`.  

### Changes

Below are breaking changes that may require some more thought when fixing.  

##### General

The structure of the AkairoClient and the various handlers has been changed.  
To see what has changed, start at [Setting Up](../basics/setup.md).  

Before, in a type function of an arg when returning a Promise, it would only be a cast failure if the Promise rejected.  
Now, it will only be cast failure if the Promise resolves with `null` or `undefined`.  
This is to make async functions easier to use.  

Similarly, in inhibitors, a Promise rejection would be used to signify that the message was to be blocked.  
Now, with Promises, the Promise has to resolve with `true` to signify a block.  

The following methods are now properties:  

- `Argument#default`
- `Command#trigger`
- `CommandHandler#prefix`
- `CommandHandler#allowMention`

This means that you have to check if its a function before using it e.g.  
`typeof arg.default === 'function' ? arg.default(message) : arg.default`.  
This allows for checking if a value was set, such as the default value of an argument.  
Of course, if you already know that the property is or is not a function, then there is no need for changes.  

##### Commands

The events `commandStarted` and `commandFinished` have new parameters.  
`commandStarted` now passes `(message, command, args)` where `args` are the parsed args.  
`commandFinished` now passes `(message, command, args, returnValue)` where `returnValue` is what the command's exec function returned.  

The event `commandBlocked` is no longer fired when permissions checks are failed.  
Instead, a new event `missingPermissions` is fired.  
It will have the params `(message, command, type, missing)` where `type` could be either `client` or `user` and `missing` are the missing permissions.  

Regex commands used to pass in the values of `(message, match, groups, edited)`.  
Now it has been changed to `(message, args)`.  
The `args` object will contain `match` and `matches` property similar to a regex type.  

CommandHandler options `handleEdits` will no longer implicitly enable the `commandUtil` option.  
The `commandUtilLifetime` option also now defaults to 5 minutes.  

All the CommandUtil parse information such as `command`, `prefix`, `alias` etc. are moved to the `parsed` property.  

The `defaultPrompt` option has been changed to `argumentDefaults` which allow for more defaults.  
You can simply move your options into `argumentDefaults.prompt`.  

##### Arguments

Argument parsing now uses a new parser.  
Some behavior with whitespace and quotes may have changed.  

The argument type function used to have a special behavior for when `true` was returned.  
It would use the original user input phrase as the evaluated argument.  
Now, it simply is just `true`.  

Argument functions `this` binding has also been changed.  
They will now all point to the Argument instance rather than being inconsistent, where some would point to the command.  

The default value of the argument `default` option is now `null` rather than an empty string.  

Type functions previously would be passed `(phrase, message, args)`.  
They now pass `(message, phrase)`.  
The previous arguments can be accessed by using a generator for arguments.  

Previously, prompt functions would be passed `(message, args, retries)`.  
They now pass `(message, data)` where `data` is an object.  
You can get the retry count, among other properties, with `data.retries`.  
The previous arguments can be accessed by using a generator for arguments.  

The argument type `invite` used to just match an invite from a string.  
Now, it will attempt to fetch an Invite object.  

### Removals

All features deprecated in v7.5.x have been removed as well as some unexpected removals.  
Suggestions will be made for replacements.  

##### General

Loading modules by instances is now unsupported.  
This means you cannot do, for example, `module.exports = new Command(...)` or `handler.load(new Listener(...))`.  
Subsequently, this also means that the constructor for AkairoModule and related have also changed.  
The constructor is now `(id, options)` instead of `(id, exec, options)`.  
The `exec` method is now also not on the AkairoModule prototype and should be implemented where needed when extending.  

The AkairoHandler method `add` has been removed.  
Use the `load` with a full path instead.  

The AkairoHandler events `add` and `reload` have been removed.  
The `load` event will now take care of both.  
When reloaded, the `load` event will pass a second parameter which is a boolean, signifying that is was a reload.  

The ability to enable/disable modules have been removed, along with the events.  
It is recommended to implement this feature manually instead.  

Both ClientUtil prompt methods, `prompt` and `promptIn` were removed.  
Alternatives includes your own message collector, using `awaitMessages`, or using `Argument#collect`.  
An example of the `collect` method would be `new Argument(command, argOptions).collect(message)`.  

Selfbot support has been removed.  

##### Commands

The command option `split` is now removed.  
Instead, the `quoted` option is added, which can be true or false, defaulting to true.  

The `match` option on an argument can no longer be a function.  

In the command `exec` function as well as the `commandStarted` event and some other places, the `edited` parameter is removed.  
To see if the message was edited, you can check with `message.edited`.    

The `dynamic` and `dynamicInt` types were removed.  
Instead, use a union type e.g. `Argument.union('integer', 'string')`.  

##### SQLiteHandler

SQLiteHandler and related properties in AkairoClient have been removed completely.  
Alternatives include `SQLiteProvider` and `SequelizeProvider`.  
Or, you can make your own by extending the `Provider` class.  
For a guide on how to use the new providers, see [Using Providers](./providers,md).  

##### Other Removals

Other removals include the send aliases in CommandUtil, deprecated methods in ClientUtil, and some methods in AkairoClient.  
Most of them can now be found in Discord.js itself or implemented yourself if needed.  
