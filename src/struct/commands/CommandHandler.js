const path = require('path');
const EventEmitter = require('events');
const rread = require('readdir-recursive');
const { Collection } = require('discord.js');
const Command = require('./Command');
const Category = require('./Category');
const { CommandHandlerEvents, BuiltInReasons } = require('../utils/Constants');

/** @extends EventEmitter */
class CommandHandler extends EventEmitter {
    /**
     * Loads Commands and handles messages.
     * @param {Framework} framework - The Akairo framework.
     * @param {Object} options - Options from framework.
     */
    constructor(framework, options = {}){
        super();

        /**
         * The Akairo framework.
         * @readonly
         * @type {Framework}
         */
        this.framework = framework;

        /**
         * Directory to commands.
         * @readonly
         * @type {string}
         */
        this.directory = path.resolve(options.commandDirectory);

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

        /**
         * Commands loaded, mapped by ID to Command.
         * @type {Collection.<string, Command>}
         */
        this.commands = new Collection();

        /**
         * Command categories, mapped by ID to Category.
         * @type {Collection.<string, Category>}
         */
        this.categories = new Collection();

        const filepaths = rread.fileSync(this.directory);
        filepaths.forEach(filepath => {
            this.load(filepath);
        });
    }

    /**
     * Loads a Command.
     * @param {string} filepath - Path to file.
     * @returns {Command}
     */
    load(filepath){
        const command = require(filepath);

        if (!(command instanceof Command)) return;
        if (this.commands.has(command.id)) throw new Error(`Command ${command.id} already loaded.`);

        command.filepath = filepath;
        command.framework = this.framework;
        command.client = this.framework.client;
        command.commandHandler = this;

        this.commands.set(command.id, command);

        if (!this.categories.has(command.category)) this.categories.set(command.category, new Category(command.category));
        const category = this.categories.get(command.category);
        command.category = category;
        category.set(command.id, command);

        return command;
    }

    /**
     * Adds a Command.
     * @param {string} filename - Filename to lookup in the directory. A .js extension is assumed.
     */
    add(filename){
        const files = rread.fileSync(this.directory);
        const filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.emit(CommandHandlerEvents.ADD, this.load(filepath));
    }

    /**
     * Removes a Command.
     * @param {string} id - ID of the Command.
     */
    remove(id){
        const command = this.commands.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);

        delete require.cache[require.resolve(command.filepath)];
        this.commands.delete(command.id);
        
        command.category.delete(command.id);

        this.emit(CommandHandlerEvents.REMOVE, command);
    }

    /**
     * Reloads a Command.
     * @param {string} id - ID of the Command.
     */
    reload(id){
        const command = this.commands.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);

        const filepath = command.filepath;

        delete require.cache[require.resolve(command.filepath)];
        this.commands.delete(command.id);

        command.category.delete(command.id);
        
        this.emit(CommandHandlerEvents.RELOAD, this.load(filepath));
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
     * Finds a category by name.
     * @param {string} name - Name to find with.
     * @returns {Category}
     */
    findCategory(name){
        return this.categories.find(category => {
            return category.id.toLowerCase() === name.toLowerCase();
        });
    }

    /**
     * Handles a Message.
     * @param {Message} message - Message to handle.
     */
    handle(message){
        if (!this.preInhibitors){
            if (message.author.id !== this.framework.client.user.id && this.framework.client.selfbot){
                return this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.NOT_SELF);
            }

            if (message.author.id === this.framework.client.user.id && !this.framework.client.selfbot){
                return this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
            }

            if (message.author.bot){
                return this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
            }
        }

        const pretest = this.framework.inhibitorHandler ? this.framework.inhibitorHandler.testMessage.bind(this.framework.inhibitorHandler) : () => Promise.resolve();

        pretest(message).then(() => {
            const prefix = this.prefix(message).toLowerCase();
            const allowMention = this.allowMention(message);
            let start;

            if (message.content.toLowerCase().startsWith(prefix)){
                start = prefix;
            } else
            if (allowMention){
                const mentionRegex = new RegExp(`^<@!?${this.framework.client.user.id}>`);
                const mentioned = message.content.match(mentionRegex);
                
                if (mentioned){
                    start = mentioned[0];
                } else {
                    return this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
                }
            } else {
                return this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
            }

            const firstWord = message.content.replace(start, '').search(/\S/) + start.length;
            const name = message.content.slice(firstWord).split(' ')[0];
            const command = this.findCommand(name);

            if (!command) return this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
            if (!command.enabled) return this.emit(CommandHandlerEvents.COMMAND_DISABLED, message, command);

            if (!this.postInhibitors){
                if (command.ownerOnly && message.author.id !== this.framework.client.ownerID)
                    return this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.OWNER);

                if (command.channelRestriction === 'guild' && !message.guild)
                    return this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.GUILD);

                if (command.channelRestriction === 'dm' && message.guild)
                    return this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.DM);
            }

            const test = this.framework.inhibitorHandler ? this.framework.inhibitorHandler.testCommand.bind(this.framework.inhibitorHandler) : () => Promise.resolve();

            return test(message, command).then(() => {
                const content = message.content.slice(message.content.indexOf(name) + name.length + 1);
                const args = command.parse(content, message);

                this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command);
                const end = Promise.resolve(command.exec(message, args));

                return end.then(() => {
                    this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command);
                }).catch(err => {
                    this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command);
                    throw err;
                });
            }).catch(errOrReason => {
                if (errOrReason instanceof Error) throw errOrReason;
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, errOrReason);
            });
        }).catch(errOrReason => {
            if (errOrReason instanceof Error) throw errOrReason;
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, errOrReason);
        });
    }
}

module.exports = CommandHandler;

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
