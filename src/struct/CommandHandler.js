const AkairoHandler = require('./AkairoHandler');
const { BuiltInReasons, CommandHandlerEvents } = require('../util/Constants');
const { Collection } = require('discord.js');
const Command = require('./Command');
const CommandUtil = require('./CommandUtil');
const TypeResolver = require('./TypeResolver');

/**
 * Loads commands and handles messages.
 * @param {AkairoClient} client - The Akairo client.
 * @param {Object} options - Options from client.
 * @extends {AkairoHandler}
 */
class CommandHandler extends AkairoHandler {
    constructor(client, options = {}) {
        super(client, options.commandDirectory, Command);

        /**
         * The type resolver.
         * @type {TypeResolver}
         */
        this.resolver = new TypeResolver(this);

        /**
         * Collecion of command aliases.
         * @type {Collection<string, string>}
         */
        this.aliases = new Collection();

        /**
         * Set of prefix overwrites.
         * @type {Set<string|string[]|PrefixFunction>}
         */
        this.prefixes = new Set();

        /**
         * Whether or not to block others, if a selfbot.
         * @type {boolean}
         */
        this.blockNotSelf = options.blockNotSelf === undefined ? true : !!options.blockNotSelf;

        /**
         * Whether or not to block self, if not a selfbot.
         * @type {boolean}
         */
        this.blockClient = options.blockClient === undefined ? true : !!options.blockClient;

        /**
         * Whether or not to block bots.
         * @type {boolean}
         */
        this.blockBots = options.blockBots === undefined ? true : !!options.blockBots;

        /**
         * Whether or not `fetchMember()` is used on each message author from a guild.
         * @type {boolean}
         */
        this.fetchMembers = !!options.fetchMember;

        /**
         * Whether or not edits are handled.
         * @type {boolean}
         */
        this.handleEdits = !!options.handleEdits;

        /**
         * Whether or not `message.util` is assigned.
         * @type {boolean}
         */
        this.commandUtil = options.commandUtil !== undefined ? !!options.commandUtil : this.handleEdits;

        /**
         * How long a command util will last in milliseconds before it is removed.
         * @type {number}
         */
        this.commandUtilLifetime = options.commandUtilLifetime || 0;

        /**
         * Collection of CommandUtils.
         * @type {Collection<string, CommandUtil>}
         */
        this.commandUtils = new Collection();

        /**
         * Collection of cooldowns.
         * @type {Collection<string, Object>}
         */
        this.cooldowns = new Collection();

        /**
         * Default cooldown for commands.
         * @type {number}
         */
        this.defaultCooldown = options.defaultCooldown || 0;

        /**
         * Collection of sets of ongoing argument prompts.
         * @type {Collection<string, Set>}
         */
        this.prompts = new Collection();

        /**
         * Default prompt options.
         * @type {ArgumentPromptOptions}
         */
        this.defaultPrompt = Object.assign({
            start: function start(m) {
                return `${m.author}, what ${this.type} would you like to use?\n${this.description || ''}`;
            },
            retry: function retry(m) {
                return `${m.author}, you need to input a valid ${this.type}!`;
            },
            timeout: 'time ran out for command.',
            ended: 'retries limit reached for command.\nCommand has been cancelled.',
            cancel: 'command has been cancelled.',
            retries: 1,
            time: 30000,
            cancelWord: 'cancel',
            stopWord: 'stop',
            optional: false,
            infinite: false
        }, options.defaultPrompt || {});

        /**
         * Gets the prefix.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {string}
         */
        this.prefix = typeof options.prefix === 'function' ? options.prefix : () => options.prefix || '!';

        /**
         * Gets if mentions are allowed for prefixing.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {boolean}
         */
        this.allowMention = typeof options.allowMention === 'function' ? options.allowMention : () => options.allowMention;

        /**
         * Directory to commands.
         * @readonly
         * @name CommandHandler#directory
         * @type {string}
         */

        /**
         * Commands loaded, mapped by ID to Command.
         * @name CommandHandler#modules
         * @type {Collection<string, Command>}
         */
    }

    /**
     * Registers a module.
     * @private
     * @param {Command} command - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    _apply(command, filepath) {
        super._apply(command, filepath);
        this._addAliases(command);
    }

    /**
     * Deregisters a module.
     * @private
     * @param {Command} command - Module to use.
     * @returns {void}
     */
    _unapply(command) {
        this._removeAliases(command);
        super._unapply(command);
    }

    /**
     * Adds aliases of a command.
     * @private
     * @param {Command} command - Command to use.
     * @returns {void}
     */
    _addAliases(command) {
        for (const alias of command.aliases) {
            const conflict = this.aliases.get(alias.toLowerCase());
            if (conflict) throw new Error(`Alias ${alias} of ${command.id} already exists on ${conflict}.`);

            this.aliases.set(alias.toLowerCase(), command.id);
        }

        if (command.prefix === '') throw new Error('Prefix overwrites cannot be empty.');
        if (Array.isArray(command.prefix) && command.prefix.includes('')) throw new Error('Prefix overwrites cannot be empty.');
        if (command.prefix !== undefined) this.prefixes.add(command.prefix);
    }

    /**
     * Removes aliases of a command.
     * @private
     * @param {Command} command - Command to use.
     * @returns {void}
     */
    _removeAliases(command) {
        for (const alias of command.aliases) this.aliases.delete(alias.toLowerCase());

        if (command.prefix !== undefined) {
            if (!this.modules.some(c => c.id !== command.id && c.prefix === command.prefix)) {
                this.prefixes.delete(command.prefix);
            }
        }
    }

    /**
     * Finds a command by alias.
     * @param {string} name - Alias to find with.
     * @returns {Command}
     */
    findCommand(name) {
        return this.modules.get(this.aliases.get(name.toLowerCase()));
    }

    /**
     * Adds an ongoing prompt in order to prevent command usage in the channel.
     * @param {Message} message - Message to use.
     * @returns {void}
     */
    addPrompt(message) {
        let channels = this.prompts.get(message.author.id);
        if (!channels) this.prompts.set(message.author.id, new Set());

        channels = this.prompts.get(message.author.id);
        channels.add(message.channel.id);
    }

    /**
     * Removes an ongoing prompt.
     * @param {Message} message - Message to use.
     * @returns {void}
     */
    removePrompt(message) {
        const channels = this.prompts.get(message.author.id);
        if (!channels) return;

        channels.delete(message.channel.id);
        if (!channels.size) this.prompts.delete(message.author.id);
    }

    /**
     * Checks if there is an ongoing prompt.
     * @param {Message} message - Message to use.
     * @returns {boolean}
     */
    hasPrompt(message) {
        const channels = this.prompts.get(message.author.id);
        if (!channels) return false;
        return channels.has(message.channel.id);
    }

    /**
     * Handles a message.
     * @param {Message} message - Message to handle.
     * @param {boolean} edited - Whether or not the message was edited.
     * @returns {Promise<void>}
     */
    handle(message, edited) {
        const fetch = this.fetchMembers && message.guild && !message.member && !message.webhookID
            ? message.guild.fetchMember(message.author)
            : Promise.resolve();

        return fetch.then(member => {
            if (member) message.member = member;

            const allTest = this.client.inhibitorHandler
                ? this.client.inhibitorHandler.test('all', message)
                : Promise.resolve();

            return allTest;
        }).then(() => {
            if (this.blockNotSelf && message.author.id !== this.client.user.id && this.client.selfbot) {
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.NOT_SELF);
                return undefined;
            }

            if (this.blockClient && message.author.id === this.client.user.id && !this.client.selfbot) {
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
                return undefined;
            }

            if (this.blockBots && message.author.bot) {
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
                return undefined;
            }

            if (this.commandUtil) {
                if (this.commandUtils.has(message.id)) {
                    message.util = this.commandUtils.get(message.id);
                } else {
                    message.util = new CommandUtil(this.client, message);
                    this.commandUtils.set(message.id, message.util);

                    if (this.commandUtilLifetime) {
                        this.client.setTimeout(() => this.commandUtils.delete(message.id), this.commandUtilLifetime);
                    }
                }
            }

            const preTest = this.client.inhibitorHandler
                ? this.client.inhibitorHandler.test('pre', message)
                : Promise.resolve();

            return preTest.then(() => {
                if (this.hasPrompt(message)) {
                    this.emit(CommandHandlerEvents.IN_PROMPT, message);
                    return undefined;
                }

                const parsed = this._parseCommand(message, edited) || {};
                const { command, content, prefix, alias } = parsed;

                if (this.commandUtil) {
                    message.util.command = command;
                    message.util.prefix = prefix;
                    message.util.alias = alias;
                }

                if (!parsed.command) return this._handleTriggers(message, edited);

                if (!command.enabled) {
                    this.emit(CommandHandlerEvents.COMMAND_DISABLED, message, command);
                    return undefined;
                }

                if (edited && !command.editable) return undefined;
                if (this._runInhibitors(message, command)) return undefined;

                const postTest = this.client.inhibitorHandler
                    ? this.client.inhibitorHandler.test('post', message, command)
                    : Promise.resolve();

                return postTest.then(() => {
                    const onCooldown = this._handleCooldowns(message, command);
                    if (onCooldown) return undefined;

                    return command.parse(content, message).then(args => {
                        if (command.typing) message.channel.startTyping();
                        this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, edited);
                        return Promise.resolve(command.exec(message, args, edited));
                    }).then(() => {
                        this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command, edited);
                        if (command.typing) message.channel.stopTyping();
                    });
                }).catch(reason => {
                    if (command.typing) message.channel.stopTyping();

                    if (reason == null) return;
                    if (reason instanceof Error) {
                        this._handleError(reason, message, command);
                        return;
                    }

                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
                });
            });
        }).catch(reason => {
            if (reason == null) return;
            if (reason instanceof Error) {
                this._handleError(reason, message);
                return;
            }

            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        });
    }

    /**
     * Runs built in command inhibitors.
     * @private
     * @param {Message} message - Message that called the command.
     * @param {Command} command - Command to check.
     * @returns {boolean}
     */
    _runInhibitors(message, command) {
        if (command.ownerOnly) {
            const notOwner = Array.isArray(this.client.ownerID)
                ? !this.client.ownerID.includes(message.author.id)
                : message.author.id !== this.client.ownerID;

            if (notOwner) {
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.OWNER);
                return true;
            }
        }

        if (command.channelRestriction === 'guild' && !message.guild) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.GUILD);
            return true;
        }

        if (command.channelRestriction === 'dm' && message.guild) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.DM);
            return true;
        }

        if (command.clientPermissions) {
            if (typeof command.clientPermissions === 'function') {
                if (!command.clientPermissions(message)) {
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.CLIENT_PERMISSIONS);
                    return true;
                }
            } else if (message.guild && !message.channel.permissionsFor(this.client.user).has(command.clientPermissions)) {
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.CLIENT_PERMISSIONS);
                return true;
            }
        }

        if (command.userPermissions) {
            if (typeof command.userPermissions === 'function') {
                if (!command.userPermissions(message)) {
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.USER_PERMISSIONS);
                    return true;
                }
            } else if (message.guild && !message.channel.permissionsFor(message.author).has(command.userPermissions)) {
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.USER_PERMISSIONS);
                return true;
            }
        }

        return false;
    }

    /**
     * Parses the command and its argument list.
     * @private
     * @param {Message} message - Message that called the command.
     * @returns {Object}
     */
    _parseCommand(message) { // eslint-disable-line complexity
        let prefix = this.prefix(message);

        if (this.allowMention(message)) {
            prefix = Array.isArray(prefix)
                ? [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`, ...prefix]
                : [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`, prefix];
        }

        let start;
        let overwrote;

        if (Array.isArray(prefix)) {
            const match = prefix.find(p => {
                return message.content.toLowerCase().startsWith(p.toLowerCase());
            });

            start = match;
        } else if (message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
            start = prefix;
        }

        if (this.prefixes.size) {
            for (const ovPrefix of this.prefixes.keys()) {
                const commandPrefix = typeof ovPrefix === 'function' ? ovPrefix.call(this, message) : ovPrefix;

                if (Array.isArray(commandPrefix)) {
                    const match = commandPrefix.find(p => {
                        return message.content.toLowerCase().startsWith(p.toLowerCase());
                    });

                    if (match) {
                        overwrote = { start };
                        start = match;
                        break;
                    }

                    continue;
                }

                if (message.content.toLowerCase().startsWith(commandPrefix.toLowerCase())) {
                    overwrote = { start };
                    start = commandPrefix;
                    break;
                }
            }
        }

        if (start === undefined) return null;

        const startIndex = message.content.indexOf(start) + start.length;
        const argsIndex = message.content.slice(startIndex).search(/\S/) + start.length;
        const name = message.content.slice(argsIndex).split(/\s{1,}|\n{1,}/)[0];
        const command = this.findCommand(name);

        if (!command) return { prefix: start, alias: name };

        if (this.prefixes.size) {
            if (overwrote === undefined && command.prefix !== undefined) return { prefix: start, alias: name };

            if (overwrote !== undefined) {
                if (command.prefix === undefined) {
                    if (overwrote.start !== start) return { prefix: start, alias: name };
                } else {
                    const commandPrefix = typeof command.prefix === 'function' ? command.prefix.call(this, message) : command.prefix;

                    if (Array.isArray(commandPrefix)) {
                        if (!commandPrefix.some(p => p.toLowerCase() === start.toLowerCase())) {
                            return { prefix: start, alias: name };
                        }
                    } else if (commandPrefix.toLowerCase() !== start.toLowerCase()) {
                        return { prefix: start, alias: name };
                    }
                }
            }
        }

        const content = message.content.slice(argsIndex + name.length + 1);
        return { command, content, prefix: start, alias: name };
    }

    /**
     * Handles cooldowns and checks if a user is under cooldown.
     * @private
     * @param {Message} message - Message that called the command.
     * @param {Command} command - Command to cooldown.
     * @returns {boolean}
     */
    _handleCooldowns(message, command) {
        const time = command.cooldown || this.defaultCooldown;
        if (!time) return false;

        const endTime = message.createdTimestamp + time;

        const id = message.author.id;
        if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

        if (!this.cooldowns.get(id)[command.id]) {
            this.cooldowns.get(id)[command.id] = {
                timer: this.client.setTimeout(() => {
                    this.client.clearTimeout(this.cooldowns.get(id)[command.id].timer);
                    this.cooldowns.get(id)[command.id] = null;

                    if (!Object.keys(this.cooldowns.get(id)).length) {
                        this.cooldowns.delete(id);
                    }
                }, time),
                end: endTime,
                uses: 0
            };
        }

        const entry = this.cooldowns.get(id)[command.id];

        if (entry.uses >= command.ratelimit) {
            const end = this.cooldowns.get(message.author.id)[command.id].end;
            const diff = end - message.createdTimestamp;

            this.emit(CommandHandlerEvents.COMMAND_COOLDOWN, message, command, diff);
            return true;
        }

        entry.uses++;
        return false;
    }

    /**
     * Handles regex and conditional commands.
     * @private
     * @param {Message} message - Message to handle.
     * @param {boolean} edited - Whether or not the message was edited.
     * @returns {Promise<void>}
     */
    _handleTriggers(message, edited) {
        return this._handleRegex(message, edited).then(() => {
            return this._handleConditional(message, edited);
        });
    }

    /**
     * Handles regex commands.
     * @private
     * @param {Message} message - Message to handle.
     * @param {boolean} edited - Whether or not the message was edited.
     * @returns {Promise<void>}
     */
    _handleRegex(message, edited) {
        const matchedCommands = [];

        for (const command of this.modules.values()) {
            if ((edited ? command.editable : true) && command.enabled) {
                const regex = command.trigger(message);
                if (regex) matchedCommands.push({ command, regex });
            }
        }

        const triggered = [];

        for (const entry of matchedCommands) {
            const match = message.content.match(entry.regex);
            if (!match) continue;

            const groups = [];

            if (entry.regex.global) {
                let group;

                while ((group = entry.regex.exec(message.content)) != null) {
                    groups.push(group);
                }
            }

            triggered.push({ command: entry.command, match, groups });
        }

        const promises = [];

        for (const entry of triggered) {
            if (this._runInhibitors(message, entry.command)) continue;

            const postTest = this.client.inhibitorHandler
                ? this.client.inhibitorHandler.test('post', message, entry.command)
                : Promise.resolve();

            promises.push(postTest.then(() => {
                const onCooldown = this._handleCooldowns(message, entry.command);
                if (onCooldown) return undefined;

                if (entry.command.typing) message.channel.startTyping();
                this.emit(CommandHandlerEvents.COMMAND_STARTED, message, entry.command);

                return Promise.resolve(entry.command.exec(message, entry.match, entry.groups, edited)).then(() => {
                    this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, entry.command);
                    if (entry.command.typing) message.channel.stopTyping();
                });
            }).catch(reason => {
                if (entry.command.typing) message.channel.stopTyping();

                if (reason == null) return;
                if (reason instanceof Error) {
                    this._handleError(reason, message, entry.command);
                    return;
                }

                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, entry.command, reason);
            }));
        }

        return Promise.all(promises);
    }

    /**
     * Handles conditional commands.
     * @private
     * @param {Message} message - Message to handle.
     * @param {boolean} edited - Whether or not the message was edited.
     * @returns {Promise<void>}
     */
    _handleConditional(message, edited) {
        const trueCommands = this.modules.filter(command => (edited ? command.editable : true) && command.enabled && command.condition(message));

        if (!trueCommands.size) {
            this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
            return undefined;
        }

        const promises = [];

        for (const command of trueCommands.values()) {
            if (this._runInhibitors(message, command)) continue;

            const postTest = this.client.inhibitorHandler
                ? this.client.inhibitorHandler.test('post', message, command)
                : Promise.resolve();

            promises.push(postTest.then(() => {
                const onCooldown = this._handleCooldowns(message, command);
                if (onCooldown) return undefined;

                if (command.typing) message.channel.startTyping();
                this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command);

                return Promise.resolve(command.exec(message, edited)).then(() => {
                    this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command);
                    if (command.typing) message.channel.stopTyping();
                });
            }).catch(reason => {
                if (command.typing) message.channel.stopTyping();

                if (reason == null) return;
                if (reason instanceof Error) {
                    this._handleError(reason, message, command);
                    return;
                }

                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
            }));
        }

        return Promise.all(promises);
    }

    /**
     * Handles errors from the handling.
     * @private
     * @param {Error} err - The error.
     * @param {Message} message - Message that called the command.
     * @param {Command} [command] - Command that errored.
     * @returns {void}
     */
    _handleError(err, message, command) {
        if (this.listenerCount(CommandHandlerEvents.ERROR)) {
            this.emit(CommandHandlerEvents.ERROR, err, message, command);
            return;
        }

        throw err;
    }

    /**
     * Loads a command.
     * @method
     * @name CommandHandler#load
     * @param {string|Command} thing - Module or path to module.
     * @returns {Command}
     */

    /**
     * Reads all commands from the directory and loads them.
     * @method
     * @name CommandHandler#loadAll
     * @returns {CommandHandler}
     */

    /**
     * Adds a command.
     * @method
     * @name CommandHandler#add
     * @param {string} filename - Filename to lookup in the directory.
     * A .js extension is assumed.
     * @returns {Command}
     */

    /**
     * Removes a command.
     * @method
     * @name CommandHandler#remove
     * @param {string} id - ID of the command.
     * @returns {Command}
     */

    /**
     * Removes all commands.
     * @method
     * @name CommandHandler#removeAll
     * @returns {CommandHandler}
     */

    /**
     * Reloads a command.
     * @method
     * @name CommandHandler#reload
     * @param {string} id - ID of the command.
     * @returns {Command}
     */

    /**
     * Reloads all commands.
     * @method
     * @name CommandHandler#reloadAll
     * @returns {CommandHandler}
     */
}

module.exports = CommandHandler;

/**
 * Emitted when a message is blocked by a pre-message inhibitor.
 * The built-in inhibitors are 'notSelf' (for selfbots), 'client', and 'bot'.
 * @event CommandHandler#messageBlocked
 * @param {Message} message - Message sent.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a message does not start with the prefix or match a command.
 * @event CommandHandler#messageInvalid
 * @param {Message} message - Message sent.
 */

/**
 * Emitted when a command is found disabled.
 * @event CommandHandler#commandDisabled
 * @param {Message} message - Message sent.
 * @param {Command} command - Command found.
 */

/**
 * Emitted when a command is blocked by a post-message inhibitor.
 * The built-in inhibitors are 'owner', 'guild', 'dm', 'clientPermissions', and 'userPermissions'.
 * @event CommandHandler#commandBlocked
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a command is found on cooldown.
 * @event CommandHandler#commandCooldown
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {number} remaining - Remaining time in milliseconds for cooldown.
 */

/**
 * Emitted when a command starts execution.
 * @event CommandHandler#commandStarted
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {boolean} edited - Whether or not the command came from an edited message.
 */

/**
 * Emitted when a command finishes execution.
 * @event CommandHandler#commandFinished
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {boolean} edited - Whether or not the command came from an edited message.
 */

/**
 * Emitted when a user is in a command argument prompt.
 * Used to prevent usage of commands during a prompt.
 * @event CommandHandler#inPrompt
 * @param {Message} message - Message sent.
 */

/**
 * Emitted when a command or inhibitor errors.
 * @event CommandHandler#error
 * @param {Error} error - The error.
 * @param {Message} message - Message sent.
 * @param {?Command} command - Command executed.
 */

/**
 * Emitted when a command is loaded.
 * @event CommandHandler#load
 * @param {Command} command - Module loaded.
 */

/**
 * Emitted when a command is added.
 * @event CommandHandler#add
 * @param {Command} command - Command added.
 */

/**
 * Emitted when a command is removed.
 * @event CommandHandler#remove
 * @param {Command} command - Command removed.
 */

/**
 * Emitted when a command is reloaded.
 * @event CommandHandler#reload
 * @param {Command} command - Command reloaded.
 */

/**
 * Emitted when a command is enabled.
 * @event CommandHandler#enable
 * @param {Command} command - Command enabled.
 */

/**
 * Emitted when a command is disabled.
 * @event CommandHandler#disable
 * @param {Command} command - Command disabled.
 */
