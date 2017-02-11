const AkairoHandler = require('./AkairoHandler');
const { CommandHandlerEvents, BuiltInReasons } = require('../utils/Constants');

/** @extends AkairoHandler */
class CommandHandler extends AkairoHandler {
    /**
     * Loads commands and handles messages.
     * @param {AkairoClient} client - The Akairo client.
     * @param {Object} options - Options from client.
     */
    constructor(client, options = {}){
        super(client, options.commandDirectory);

        /**
         * Whether or not the built-in pre-message inhibitors are disabled.
         * @type {boolean}
         */
        this.preInhibitors = !!options.preInhibitors;

        /**
         * Whether or not the built-in post-message inhibitors are disabled.
         * @type {boolean}
         */
        this.postInhibitors = !!options.postInhibitors;

        /**
         * Gets the prefix.
         * @type {function}
         */
        this.prefix = typeof options.prefix === 'function' ? options.prefix : () => options.prefix;

        /**
         * Gets if mentions are allowed for prefixing.
         * @type {function}
         */
        this.allowMention = typeof options.allowMention === 'function' ? options.allowMention : () => options.allowMention;
    }

    /**
     * Collection of commands.
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
     */
    handle(message){
        if (!this.preInhibitors){
            if (message.author.id !== this.client.user.id && this.client.selfbot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.NOT_SELF);
                return;
            }

            if (message.author.id === this.client.user.id && !this.client.selfbot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
                return;
            }

            if (message.author.bot){
                this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
                return;
            }
        }

        const pretest = this.client.inhibitorHandler
        ? m => this.client.inhibitorHandler.testMessage(m)
        : () => Promise.resolve();

        pretest(message).then(() => {
            const prefix = this.prefix(message).toLowerCase();
            const allowMention = this.allowMention(message);
            let start;

            if (message.content.toLowerCase().startsWith(prefix)){
                start = prefix;
            } else
            if (allowMention){
                const mentionRegex = new RegExp(`^<@!?${this.client.user.id}>`);
                const mentioned = message.content.match(mentionRegex);
                
                if (mentioned){
                    start = mentioned[0];
                } else {
                    this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
                    return;
                }
            } else {
                this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
                return;
            }

            const firstWord = message.content.replace(start, '').search(/\S/) + start.length;
            const name = message.content.slice(firstWord).split(' ')[0];
            const command = this.findCommand(name);

            if (!command) return this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
            if (!command.enabled) return this.emit(CommandHandlerEvents.COMMAND_DISABLED, message, command);

            if (!this.postInhibitors){
                if (command.ownerOnly && message.author.id !== this.client.ownerID){
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

                return end.then(() => this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command)).catch(err => {
                    this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command);
                    throw err;
                });
            }).catch(reason => {
                if (reason instanceof Error) throw reason;
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
            });
        }).catch(reason => {
            if (reason instanceof Error) throw reason;
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        });
    }
}

module.exports = CommandHandler;

/**
 * Emitted when a message is blocked by a pre-message inhibitor. The built-in inhibitors are 'notSelf' (for selfbots), 'client', and 'bot'.
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
 * Emitted when a command is blocked by a post-message inhibitor. The built-in inhibitors are 'owner', 'guild', and 'dm'.
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
