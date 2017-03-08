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
         * Whether or not the built-in pre-message inhibitors are enabled.
         * @type {boolean}
         */
        this.preInhibitors = !(options.preInhibitors === false);

        /**
         * Whether or not the built-in post-message inhibitors are enabled.
         * @type {boolean}
         */
        this.postInhibitors = !(options.postInhibitors === false);

        /**
         * Collection of cooldowns.
         * @type {Collection<string, Object>}
         */
        this.cooldowns = new Collection();

        /**
         * Set of ongoing argument prompts.
         * @type {Set.<string>}
         */
        this.prompts = new Set();

        /**
         * Default prompt functions.
         * @type {PromptFunctions}
         */
        this.defaultPrompts = {
            start: function(m){ return `${m.author}, you need to input a valid ${this.type}!`; },
            retry: function(m){ return `${m.author}, you need to input a valid ${this.type}!`; },
            time: function(m){ return `${m.author}, time ran out for command.`; },
            end: function(m){ return `${m.author}, retries limit reached for command.`; },
            cancel: function(m){ return `${m.author}, command cancelled.`; }
        };

        Object.assign(this.defaultPrompts, options.defaultPrompts || {});

        /**
         * Default amount of retries for a prompt.
         * @type {number}
         */
        this.defaultRetries = options.defaultRetries || 1;

        /**
         * Word used to cancel a prompt.
         * @type {string}
         */
        this.cancelWord = options.cancelWord || 'cancel';

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
     * Collection of commands.<br>Alias to this.modules.
     * @type {Collection<string, Command>}
     */
    get commands(){
        return this.modules;
    }

    /**
     * Finds a command by alias.
     * @param {string} name - Alias to find with.
     * @returns {Command}
     */
    findCommand(name){
        return this.commands.find(command => {
            return command.aliases.some(a => a.toLowerCase() === name.toLowerCase());
        });
    }

    /**
     * Handles a message.
     * @param {Message} message - Message to handle.
     * @returns {Promise}
     */
    handle(message){
        if (this.preInhibitors){
            if (message.author.id !== this.client.user.id && this.client.selfbot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.NOT_SELF);
                return Promise.resolve();
            }

            if (message.author.id === this.client.user.id && !this.client.selfbot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
                return Promise.resolve();
            }

            if (message.author.bot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
                return Promise.resolve();
            }
        }

        const pretest = this.client.inhibitorHandler
        ? m => this.client.inhibitorHandler.testMessage(m)
        : () => Promise.resolve();

        return pretest(message).then(() => {
            if (this.prompts.has(message.author.id + message.channel.id)){
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
                    return this._handleTriggers(message);
                }
            } else {
                return this._handleTriggers(message);
            }

            const firstWord = message.content.replace(start, '').search(/\S/) + start.length;
            const name = message.content.slice(firstWord).split(' ')[0];
            const command = this.findCommand(name);

            if (!command) return this._handleTriggers(message);
            if (!command.enabled) return void this.emit(CommandHandlerEvents.COMMAND_DISABLED, message, command);

            if (this.postInhibitors){
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
            }

            const test = this.client.inhibitorHandler
            ? (m, c) => this.client.inhibitorHandler.testCommand(m, c)
            : () => Promise.resolve();

            return test(message, command).then(() => {
                const onCooldown = this._handleCooldowns(message, command);
                if (onCooldown) return;

                const content = message.content.slice(message.content.indexOf(name) + name.length + 1);

                return command.parse(content, message).then(args => {
                    this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command);
                    const end = Promise.resolve(command.exec(message, args));

                    return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command))
                    .catch(err => this._handleError(err, message, command));
                }).catch(err => {
                    if (err instanceof Error) throw err;
                });
            }).catch(reason => {
                if (reason instanceof Error) return this._handleError(reason, message, command);
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
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

    _handleTriggers(message){
        const commands = this.commands.filter(c => c.trigger(message));
        const triggered = [];

        for (const c of commands.values()){
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
            const end = Promise.resolve(c[0].exec(message, c[1], c[2]));

            return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, c[0])).catch(err => {
                return this._handleError(err, message, c[0]);
            });
        })).then(() => {
            const trueCommands = this.commands.filter(c => c.condition(message));
            
            if (!trueCommands.size) return void this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);

            return Promise.all(trueCommands.map(c => {
                const onCooldown = this._handleCooldowns(message, c);
                if (onCooldown) return;
                
                this.emit(CommandHandlerEvents.COMMAND_STARTED, message, c);
                const end = Promise.resolve(c.exec(message));

                return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, c)).catch(err => {
                    return this._handleError(err, message, c);
                });
            }));
        }).then(() => {});
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
     * @param {string} filename - Filename to lookup in the directory.<br>A .js extension is assumed.
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
 * Emitted when a message is blocked by a pre-message inhibitor.<br>The built-in inhibitors are 'notSelf' (for selfbots), 'client', and 'bot'.
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
 * Emitted when a command is blocked by a post-message inhibitor.<br>The built-in inhibitors are 'owner', 'guild', and 'dm'.
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
 */

/**
 * Emitted when a command finishes execution.
 * @event CommandHandler#commandFinished
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 */

/**
 * Emitted when a user is in a command prompt.
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
