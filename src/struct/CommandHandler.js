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
    constructor(client, options = {}){
        super(client, options.commandDirectory, Command);

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
            start: function(m){
                return `${m.author}, what ${this.type} would you like to use?\n${this.description || ''}`;
            },
            retry: function(m){
                return `${m.author}, you need to input a valid ${this.type}!`;
            },
            timeout: function(m){
                return `${m.author}, time ran out for command.`;
            },
            ended: function(m){
                return `${m.author}, retries limit reached for command.\nCommand has been cancelled.`;
            },
            cancel: function(m){
                return `${m.author}, command has been cancelled.`;
            },
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
     * Finds a command by alias.
     * @param {string} name - Alias to find with.
     * @returns {Command}
     */
    findCommand(name){
        return this.modules.find(command => {
            return command.aliases.some(a => a.toLowerCase() === name.toLowerCase());
        });
    }

    /**
     * Adds an ongoing prompt in order to prevent command usage in the channel.
     * @param {Message} message - Message to use.
     * @returns {void}
     */
    addPrompt(message){
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
    removePrompt(message){
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
    hasPrompt(message){
        const channels = this.prompts.get(message.author.id);
        if (!channels) return false;

        return channels.has(message.channel.id);
    }

    /**
     * Handles a message.
     * @param {Message} message - Message to handle.
     * @param {boolean} edited - Whether or not the message was edited.
     * @returns {Promise}
     */
    handle(message, edited){
        const alltest = this.client.inhibitorHandler
        ? m => this.client.inhibitorHandler.test('all', m)
        : () => Promise.resolve();

        return alltest(message).then(() => {
            if (this.blockNotSelf && message.author.id !== this.client.user.id && this.client.selfbot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.NOT_SELF);
                return;
            }

            if (this.blockClient && message.author.id === this.client.user.id && !this.client.selfbot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
                return;
            }

            if (this.blockBots && message.author.bot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
                return;
            }

            const pretest = this.client.inhibitorHandler
            ? m => this.client.inhibitorHandler.test('pre', m)
            : () => Promise.resolve();

            return pretest(message).then(() => {
                if (this.hasPrompt(message)){
                    this.emit(CommandHandlerEvents.IN_PROMPT, message);
                    return Promise.resolve();
                }
                
                const prefix = this.prefix(message);
                const allowMention = this.allowMention(message);
                let start;

                if (Array.isArray(prefix)){
                    const match = prefix.find(p => {
                        return message.content.toLowerCase().startsWith(p.toLowerCase());
                    });

                    if (match == null) return this._handleTriggers(message);
                    start = match;
                } else
                if (message.content.toLowerCase().startsWith(prefix.toLowerCase())){
                    start = prefix;
                } else
                if (allowMention){
                    const mentionRegex = new RegExp(`^<@!?${this.client.user.id}>`);
                    const mentioned = message.content.match(mentionRegex);
                    
                    if (mentioned){
                        start = mentioned[0];
                    } else {
                        return this._handleTriggers(message, edited);
                    }
                } else {
                    return this._handleTriggers(message, edited);
                }

                const firstWord = message.content.replace(start, '').search(/\S/) + start.length;
                const name = message.content.slice(firstWord).split(' ')[0];
                const command = this.findCommand(name);

                if (!command) return this._handleTriggers(message, edited);
                if (!command.enabled) return void this.emit(CommandHandlerEvents.COMMAND_DISABLED, message, command);
                if (edited && !command.editable) return;

                if (command.ownerOnly){
                    const notOwner = Array.isArray(this.client.ownerID)
                    ? !this.client.ownerID.includes(message.author.id)
                    : message.author.id !== this.client.ownerID;

                    if (notOwner){
                        this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.OWNER);
                        return;
                    }
                }

                if (command.channelRestriction === 'guild' && !message.guild){
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.GUILD);
                    return;
                }

                if (command.channelRestriction === 'dm' && message.guild){
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.DM);
                    return;
                }

                const test = this.client.inhibitorHandler
                ? (m, c) => this.client.inhibitorHandler.test('post', m, c)
                : () => Promise.resolve();

                return test(message, command).then(() => {
                    const onCooldown = this._handleCooldowns(message, command);
                    if (onCooldown) return;

                    const content = message.content.slice(message.content.indexOf(name) + name.length + 1);

                    return command.parse(content, message).then(args => {
                        this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, edited);
                        const end = Promise.resolve(command.exec(message, args, edited));

                        return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command, edited))
                        .catch(err => this._handleError(err, message, command));
                    }).catch(err => {
                        if (err instanceof Error) throw err;
                    });
                }).catch(reason => {
                    if (reason instanceof Error) return this._handleError(reason, message, command);
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
                });
            });
        }).catch(reason => {
            if (reason instanceof Error) return this._handleError(reason, message);
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        });
    }

    _handleCooldowns(message, command){
        if (!command.cooldown) return false;
        
        const id = message.author.id;
        if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

        const time = command.cooldown || this.defaultCooldown;
        const endTime = message.createdTimestamp + time;

        if (!this.cooldowns.get(id)[command.id]) this.cooldowns.get(id)[command.id] = {
            timer: this.client.setTimeout(() => {
                this.client.clearTimeout(this.cooldowns.get(id)[command.id].timer);
                delete this.cooldowns.get(id)[command.id];
                
                if (!Object.keys(this.cooldowns.get(id)).length){
                    this.cooldowns.delete(id);
                }
            }, time),
            end: endTime,
            uses: 0
        };

        const entry = this.cooldowns.get(id)[command.id];

        if (entry.uses >= command.ratelimit){
            const end = this.cooldowns.get(message.author.id)[command.id].end;
            const diff = end - message.createdTimestamp;

            this.emit(CommandHandlerEvents.COMMAND_COOLDOWN, message, command, diff);
            return true;
        }

        entry.uses++;
        return false;
    }

    _handleTriggers(message, edited){
        const matchedCommands = this.modules.filter(c => (!c.editable || edited && c.editable) && c.enabled && c.trigger(message));
        const triggered = [];

        for (const c of matchedCommands.values()){
            const regex = c.trigger(message);
            const match = message.content.match(regex);

            if (match){
                const groups = [];

                if (regex.global){
                    let group;
                    
                    while((group = regex.exec(message.content)) != null){
                        groups.push(group);
                    }
                }
                
                triggered.push([c, match, groups]);
            }
        }

        return Promise.all(triggered.map(c => {
            const onCooldown = this._handleCooldowns(message, c[0]);
            if (onCooldown) return;

            this.emit(CommandHandlerEvents.COMMAND_STARTED, message, c[0]);
            const end = Promise.resolve(c[0].exec(message, c[1], c[2], edited));

            return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, c[0])).catch(err => {
                return this._handleError(err, message, c[0]);
            });
        })).then(() => {
            const trueCommands = this.modules.filter(c => (!c.editable || edited && c.editable) && c.enabled && c.condition(message));
            
            if (!trueCommands.size) return void this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);

            return Promise.all(trueCommands.map(c => {
                const onCooldown = this._handleCooldowns(message, c);
                if (onCooldown) return;
                
                this.emit(CommandHandlerEvents.COMMAND_STARTED, message, c);
                const end = Promise.resolve(c.exec(message, edited));

                return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, c)).catch(err => {
                    return this._handleError(err, message, c);
                });
            }));
        });
    }

    _handleError(err, message, command){
        if (this.listenerCount(CommandHandlerEvents.ERROR)){
            this.emit(CommandHandlerEvents.ERROR, err, message, command);
            return;
        }

        throw err;
    }

    /**
     * Loads a command.
     * @method
     * @param {string} filepath - Path to file.
     * @name CommandHandler#load
     * @returns {Command}
     */

    /**
     * Adds a command.
     * @method
     * @param {string} filename - Filename to lookup in the directory.
     * <br>A .js extension is assumed.
     * @name CommandHandler#add
     * @returns {Command}
     */

    /**
     * Removes a command.
     * @method
     * @param {string} id - ID of the command.
     * @name CommandHandler#remove
     * @returns {Command}
     */

    /**
     * Reloads a command.
     * @method
     * @param {string} id - ID of the command.
     * @name CommandHandler#reload
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
