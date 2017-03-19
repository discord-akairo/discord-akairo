const AkairoHandler = require('./AkairoHandler');
const Command = require('./Command');
const TypeResolver = require('../util/TypeResolver');
const { CommandHandlerEvents, BuiltInReasons } = require('../util/Constants');
const { Collection } = require('discord.js');

/** @extends AkairoHandler */
class CommandHandler extends AkairoHandler {
    /**
     * Loads commands and handles messages.
     * @param {AkairoClient} client - The Akairo client.
     * @param {Object} options - Options from client.
     */
    constructor(client, options = {}) {
        super(client, options.commandDirectory, Command);

        /**
         * Collecion of command aliases.
         * @type {Collection<string, string>}
         */
        this.aliases = new Collection();

        /**
         * Set of prefix overwrites.
         * @type {Set<string>}
         */
        this.prefixes = new Set();

        /**
         * The type resolver.
         * @type {TypeResolver}
         */
        this.resolver = new TypeResolver(client);

        /**
         * Whether or not to block others, if a selfbot.
         * @type {boolean}
         */
        this.blockNotSelf = !(options.blockNotSelf === false);

        /**
         * Whether or not to block self, if not a selfbot.
         * @type {boolean}
         */
        this.blockClient = !(options.blockClient === false);

        /**
         * Whether or not to block bots.
         * @type {boolean}
         */
        this.blockBots = !(options.blockBots === false);

        /**
         * Whether or not edits are handled.
         * @type {boolean}
         */
        this.handleEdits = !!options.handleEdits;

        /**
         * Collection of cooldowns.
         * @type {Collection<string, Object>}
         */
        this.cooldowns = new Collection();

        /**
         * Collection of sets of ongoing argument prompts.
         * @type {Collection<string, Set>}
         */
        this.prompts = new Collection();

        /**
         * Default prompt options.
         * @type {PromptOptions}
         */
        this.defaultPrompt = {
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
            cancelWord: 'cancel'
        };

        Object.assign(this.defaultPrompt, options.defaultPrompt || {});

        /**
         * Default cooldown for commands.
         * @type {number}
         */
        this.defaultCooldown = options.defaultCooldown || 0;

        /**
         * Gets the prefix.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {string}
         */
        this.prefix = typeof options.prefix === 'function' ? options.prefix : () => options.prefix;

        /**
         * Gets if mentions are allowed for prefixing.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {boolean}
         */
        this.allowMention = typeof options.allowMention === 'function' ? options.allowMention : () => options.allowMention;

        for (const id of this.modules.keys()) this._addAliases(id);

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
     * Loads a command.
     * @param {string|Command} thing - Module or path to module.
     * @returns {Command}
     */
    load(thing) {
        const command = super.load(thing);
        if (this.aliases) this._addAliases(command.id);
        return command;
    }

    /**
     * Removes a command.
     * @param {string} id - ID of the command.
     * @returns {Command}
     */
    remove(id) {
        id = id.toString();

        const command = this.modules.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);
        this._removeAliases(command.id);

        return super.remove(id);
    }

    /**
     * Reloads a command.
     * @param {string} id - ID of the command.
     * @returns {Command}
     */
    reload(id) {
        id = id.toString();

        const command = this.modules.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);
        this._removeAliases(command.id);

        return super.reload(id);
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
        const alltest = this.client.inhibitorHandler
        ? m => this.client.inhibitorHandler.test('all', m)
        : () => Promise.resolve();

        return alltest(message).then(() => {
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

            const pretest = this.client.inhibitorHandler
            ? m => this.client.inhibitorHandler.test('pre', m)
            : () => Promise.resolve();

            return pretest(message).then(() => {
                if (this.hasPrompt(message)) {
                    this.emit(CommandHandlerEvents.IN_PROMPT, message);
                    return Promise.resolve();
                }

                const parsed = this._parseCommand(message, edited);
                if (!parsed) return this._handleTriggers(message, edited);

                const { command, content } = parsed;

                if (!command.enabled) {
                    this.emit(CommandHandlerEvents.COMMAND_DISABLED, message, command);
                    return undefined;
                }

                if (edited && !command.editable) return undefined;

                if (command.ownerOnly) {
                    const notOwner = Array.isArray(this.client.ownerID)
                    ? !this.client.ownerID.includes(message.author.id)
                    : message.author.id !== this.client.ownerID;

                    if (notOwner) {
                        this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.OWNER);
                        return undefined;
                    }
                }

                if (command.channelRestriction === 'guild' && !message.guild) {
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.GUILD);
                    return undefined;
                }

                if (command.channelRestriction === 'dm' && message.guild) {
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.DM);
                    return undefined;
                }

                const test = this.client.inhibitorHandler
                ? (m, c) => this.client.inhibitorHandler.test('post', m, c)
                : () => Promise.resolve();

                return test(message, command).then(() => {
                    const onCooldown = this._handleCooldowns(message, command);
                    if (onCooldown) return undefined;

                    return command.parse(content, message).then(args => {
                        this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, edited);
                        const end = Promise.resolve(command.exec(message, args, edited));

                        return end.then(() => {
                            this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command, edited);
                        }).catch(err => {
                            this._handleError(err, message, command);
                        });
                    }).catch(err => {
                        if (err instanceof Error) this._handleError(err, message, command);
                    });
                }).catch(reason => {
                    if (reason instanceof Error) return this._handleError(reason, message, command);
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
                    return undefined;
                });
            });
        }).catch(reason => {
            if (reason instanceof Error) return this._handleError(reason, message);
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
            return undefined;
        });
    }

    /**
     * Parses the command and its argument list.
     * @private
     * @param {Message} message - Message that called the command.
     * @returns {Object}
     */
    _parseCommand(message) {
        const prefix = this.prefix(message);
        const allowMention = this.allowMention(message);
        let start;
        let overwrite;

        if (Array.isArray(prefix)) {
            const match = prefix.find(p => {
                return message.content.toLowerCase().startsWith(p.toLowerCase());
            });

            start = match;
        } else
        if (message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
            start = prefix;
        } else
        if (allowMention) {
            const mentionRegex = new RegExp(`^<@!?${this.client.user.id}>`);
            const mentioned = message.content.match(mentionRegex);

            if (mentioned) start = mentioned[0];
        }

        for (const ovPrefix of this.prefixes.keys()) {
            if (Array.isArray(ovPrefix)) {
                const match = ovPrefix.find(p => {
                    return message.content.toLowerCase().startsWith(p.toLowerCase());
                });

                if (match) {
                    overwrite = { ovPrefix, start };
                    start = match;
                    break;
                }

                continue;
            }

            if (message.content.toLowerCase().startsWith(ovPrefix.toLowerCase())) {
                overwrite = { ovPrefix, start };
                start = ovPrefix;
                break;
            }
        }

        if (start == null) return null;

        const startRegex = new RegExp(start.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), 'i'); // eslint-disable-line no-useless-escape
        const firstWord = message.content.replace(startRegex, '').search(/\S/) + start.length;
        const name = message.content.slice(firstWord).split(/\s{1,}|\n{1,}/)[0];
        const command = this.findCommand(name);

        if (!command) return null;
        if (overwrite == null && command.prefix != null) return null;

        if (overwrite != null) {
            if (command.prefix == null) {
                if (overwrite.start !== start) return null;
            } else
            if (Array.isArray(command.prefix)) {
                if (!command.prefix.some(p => p.toLowerCase() === start.toLowerCase())) {
                    return null;
                }
            } else
            if (command.prefix.toLowerCase() !== start.toLowerCase()) {
                return null;
            }
        }

        const content = message.content.slice(message.content.indexOf(name) + name.length + 1);
        return { command, content };
    }

    /**
     * Handles cooldowns and checks if a user is under cooldown.
     * @private
     * @param {Message} message - Message that called the command.
     * @param {Command} command - Command to cooldown.
     * @returns {boolean}
     */
    _handleCooldowns(message, command) {
        if (!command.cooldown) return false;

        const id = message.author.id;
        if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

        const time = command.cooldown || this.defaultCooldown;
        const endTime = message.createdTimestamp + time;

        if (!this.cooldowns.get(id)[command.id]) {
            this.cooldowns.get(id)[command.id] = {
                timer: this.client.setTimeout(() => {
                    this.client.clearTimeout(this.cooldowns.get(id)[command.id].timer);
                    delete this.cooldowns.get(id)[command.id];

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
        const matchedCommands = this.modules.filter(c => (edited ? c.editable : true) && c.enabled && c.trigger(message));
        const triggered = [];

        for (const c of matchedCommands.values()) {
            const regex = c.trigger(message);
            const match = message.content.match(regex);

            if (match) {
                const groups = [];

                if (regex.global) {
                    let group;

                    while ((group = regex.exec(message.content)) != null) {
                        groups.push(group);
                    }
                }

                triggered.push([c, match, groups]);
            }
        }

        return Promise.all(triggered.map(c => {
            const onCooldown = this._handleCooldowns(message, c[0]);
            if (onCooldown) return undefined;

            this.emit(CommandHandlerEvents.COMMAND_STARTED, message, c[0]);
            const end = Promise.resolve(c[0].exec(message, c[1], c[2], edited));

            return end.then(() => {
                this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, c[0]);
            }).catch(err => {
                this._handleError(err, message, c[0]);
            });
        })).then(() => {
            const trueCommands = this.modules.filter(c => (edited ? c.editable : true) && c.enabled && c.condition(message));

            if (!trueCommands.size) {
                this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
                return undefined;
            }

            return Promise.all(trueCommands.map(c => {
                const onCooldown = this._handleCooldowns(message, c);
                if (onCooldown) return undefined;

                this.emit(CommandHandlerEvents.COMMAND_STARTED, message, c);
                const end = Promise.resolve(c.exec(message, edited));

                return end.then(() => {
                    this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, c);
                }).catch(err => {
                    this._handleError(err, message, c);
                });
            }));
        });
    }

    /**
     * Handles errors from the handling.
     * @private
     * @param {Error} err - The error.
     * @param {Message} message - Message that called the command.
     * @param {Command} [command] - Command that errored.
     */
    _handleError(err, message, command) {
        if (this.listenerCount(CommandHandlerEvents.ERROR)) {
            this.emit(CommandHandlerEvents.ERROR, err, message, command);
            return;
        }

        throw err;
    }

    /**
     * Adds aliases of a command.
     * @private
     * @param {string} id - ID of command.
     */
    _addAliases(id) {
        const command = this.modules.get(id.toString());
        if (!command) throw new Error(`Command ${id} does not exist.`);

        for (const alias of command.aliases) this.aliases.set(alias.toLowerCase(), command.id);
        if (command.prefix != null) this.prefixes.add(command.prefix);
    }

    /**
     * Removes aliases of a command.
     * @private
     * @param {string} id - ID of command.
     */
    _removeAliases(id) {
        const command = this.modules.get(id.toString());
        if (!command) throw new Error(`Command ${id} does not exist.`);

        for (const alias of command.aliases) this.aliases.delete(alias.toLowerCase());
        if (command.prefix != null) this.prefixes.delete(command.prefix);
    }

    /**
     * Adds a command.
     * @method
     * @param {string} filename - Filename to lookup in the directory.
     * <br>A .js extension is assumed.
     * @name CommandHandler#add
     * @returns {Command}
     */

    /**
     * Reloads all commands.
     * @method
     * @name CommandHandler#reloadAll
     */
}

module.exports = CommandHandler;

/**
 * Emitted when a message is blocked by a pre-message inhibitor.
 * <br>The built-in inhibitors are 'notSelf' (for selfbots), 'client', and 'bot'.
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
 * <br>The built-in inhibitors are 'owner', 'guild', and 'dm'.
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
 * <br>Used to prevent usage of commands during a prompt.
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
