const AkairoHandler = require('./AkairoHandler');
const Command = require('./Command');
const { CommandHandlerEvents, BuiltInReasons } = require('../utils/Constants');

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
         * Gets the prefix.
         * @method
         * @returns {string}
         */
        this.prefix = typeof options.prefix === 'function' ? options.prefix : () => options.prefix;

        /**
         * Gets if mentions are allowed for prefixing.
         * @method
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
         * @type {Collection.<string, Command>}
         */
    }

    /**
     * Collection of commands.<br/>Alias to this.modules.
     * @type {Collection.<string, Command>}
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

        const errored = (err, msg, cmd) => {
            if (this.listenerCount(CommandHandlerEvents.ERROR)){
                this.emit(CommandHandlerEvents.ERROR, err, msg, cmd);
                return;
            }

            throw err;
        };

        return pretest(message).then(() => {
            const prefix = this.prefix(message);
            const allowMention = this.allowMention(message);
            let start;

            const notCommand = () => {
                const commands = this.commands.filter(c => c.trigger);
                const triggered = [];

                commands.forEach(c => {
                    const match = message.content.match(c.trigger);
                    if (match){
                        const groups = [];

                        if (c.trigger.global){
                            let group;
                            
                            while((group = c.trigger.exec(message.content)) != null){
                                groups.push(group);
                            }
                        }
                        
                        triggered.push([c, match, groups]);
                    }
                });

                if (!triggered.length) return void this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);

                triggered.forEach(c => {
                    this.emit(CommandHandlerEvents.COMMAND_STARTED, message, c[0]);
                    const end = Promise.resolve(c[0].exec(message, c[1], c[2]));

                    return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, c[0])).catch(err => {
                        return errored(err, message, c[0]);
                    });
                });
            };

            if (Array.isArray(prefix)){
                const match = prefix.find(p => {
                    return message.content.toLowerCase().startsWith(p.toLowerCase());
                });

                if (!match) return notCommand();

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
                    return notCommand();
                }
            } else {
                return notCommand();
            }

            const firstWord = message.content.replace(start, '').search(/\S/) + start.length;
            const name = message.content.slice(firstWord).split(' ')[0];
            const command = this.findCommand(name);

            if (!command) return notCommand();
            if (!command.enabled) return void this.emit(CommandHandlerEvents.COMMAND_DISABLED, message, command);

            if (this.postInhibitors){
                const notOwner = Array.isArray(this.client.ownerID)
                ? !this.client.ownerID.includes(message.author.id)
                : message.author.id !== this.client.ownerID;

                if (command.ownerOnly && notOwner){
                    this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.OWNER);
                    return;
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
                const content = message.content.slice(message.content.indexOf(name) + name.length + 1);
                const args = command.parse(content, message);

                this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command);
                const end = Promise.resolve(command.exec(message, args));

                return end.then(() => void this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command)).catch(err => {
                    return errored(err, message, command);
                });
            }).catch(reason => {
                if (reason instanceof Error) return errored(reason, message, command);
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
            });
        }).catch(reason => {
            if (reason instanceof Error) return errored(reason, message);
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        });
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
     * @param {string} filename - Filename to lookup in the directory.<br/>A .js extension is assumed.
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
 * Emitted when a message is blocked by a pre-message inhibitor.<br/>The built-in inhibitors are 'notSelf' (for selfbots), 'client', and 'bot'.
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
 * Emitted when a command is blocked by a post-message inhibitor.<br/>The built-in inhibitors are 'owner', 'guild', and 'dm'.
 * @event CommandHandler#commandBlocked
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} reason - Reason for the block.
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
