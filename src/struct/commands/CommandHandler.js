const path = require('path');
const EventEmitter = require('events');
const rread = require('readdir-recursive');
const Command = require('./Command');
const Inhibitor = require('./Inhibitor');
const Collection = require('discord.js').Collection;

/** @extends EventEmitter */
class CommandHandler extends EventEmitter {
    /**
     * Creates a new CommandHandler.
     * @param {Framework} framework - The Akairo framework.
     */
    constructor(framework){
        super();

        /**
         * The Akairo framework.
         * @type {Framework}
         */
        this.framework = framework;

        /**
         * Directory to commands.
         * @type {string}
         */
        this.commandDirectory = path.resolve(this.framework.options.commandDirectory);

        /**
         * Directory to inhibitors.
         * @type {string}
         */
        this.inhibitorDirectory = path.resolve(this.framework.options.inhibitorDirectory);

        /**
         * Commands loaded, mapped by ID to Command.
         * @type {Collection.<string, Command>}
         */
        this.commands = new Collection();

        /**
         * Commands categories mapped by name to Array of Commands.
         * @type {Map.<string, Array.<Command>>}
         */
        this.categories = new Collection();

        /**
         * Inhibitors loaded, mapped by ID to Inhibitor.
         * @type {Collection.<string, Inhibitor>}
         */
        this.inhibitors = new Collection();

        let cmdPaths = rread.fileSync(this.commandDirectory);
        cmdPaths.forEach(filepath => {
            this.loadCommand(filepath);
        });

        let inhibPaths = rread.fileSync(this.inhibitorDirectory);
        inhibPaths.forEach(filepath => {
            this.loadInhibitor(filepath);
        });
    }

    /**
     * Loads a Command.
     * @param {string} filepath - Path to file.
     */
    loadCommand(filepath){
        let command = require(filepath);

        if (!(command instanceof Command)) return;
        if (this.commands.has(command.id)) throw new Error(`Command ${command.id} already loaded.`);

        command.filepath = filepath;
        command.framework = this.framework;
        command.client = this.framework.client;
        command.commandHandler = this;

        this.commands.set(command.id, command);

        if (!this.categories.has(command.options.category)) this.categories.set(command.options.category, []);
        this.categories.get(command.options.category).push(command);
    }

    /**
     * Adds a Command.
     * @param {string} filename - Filename to lookup in the directory. A .js extension is assumed.
     */
    addCommand(filename){
        let files = rread.fileSync(this.commandDirectory);
        let filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.loadCommand(filepath);
    }

    /**
     * Removes a Command.
     * @param {string} id - ID of the Command.
     */
    removeCommand(id){
        let command = this.commands.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);

        delete require.cache[require.resolve(command.filepath)];
        this.commands.delete(command.id);
        
        let category = this.categories.get(command.options.category);
        category.splice(category.indexOf(command), 1);
    }

    /**
     * Reloads a Command.
     * @param {string} id - ID of the Command.
     */
    reloadCommand(id){
        let command = this.commands.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);

        let filepath = command.filepath;

        delete require.cache[require.resolve(command.filepath)];
        this.commands.delete(command.id);

        let category = this.categories.get(command.options.category);
        category.splice(category.indexOf(command), 1);
        
        this.loadCommand(filepath);
    }

    /**
     * Finds a command by alias.
     * @param {string} name - Alias to find with.
     */
    findCommand(name){
        return this.commands.find(command => {
            return command.aliases.some(a => a.toLowerCase() === name.toLowerCase());
        });
    }

    /**
     * Finds a category by name.
     * @param {string} name - Name to find with.
     */
    findCategory(name){
        let key = Array.from(this.categories.keys()).find(k => k.toLowerCase() === name.toLowerCase());
        return this.categories.get(key);
    }

    /**
     * Loads an Inhibitor.
     * @param {string} filepath - Path to file.
     */
    loadInhibitor(filepath){
        let inhibitor = require(filepath);

        if (!(inhibitor instanceof Inhibitor)) return;
        if (this.inhibitors.has(inhibitor.id)) throw new Error(`Inhibitor ${inhibitor.id} already loaded.`);

        inhibitor.filepath = filepath;
        inhibitor.framework = this.framework;
        inhibitor.client = this.framework.client;
        inhibitor.commandHandler = this;

        this.inhibitors.set(inhibitor.id, inhibitor);
    }

    /**
     * Adds an Inhibitor.
     * @param {string} filename - Filename to lookup in the directory. A .js extension is assumed.
     */
    addInhibitor(filename){
        let files = rread.fileSync(this.inhibitorDirectory);
        let filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.loadInhibitor(filepath);
    }

    /**
     * Removes an Inhibitor.
     * @param {string} id - ID of the Inhibitor.
     */
    removeInhibitor(id){
        let inhibitor = this.inhibitors.get(id);
        if (!inhibitor) throw new Error(`Inhibitor ${id} does not exist.`);

        delete require.cache[require.resolve(inhibitor.filepath)];
        this.inhibitors.delete(inhibitor.id);
    }

    /**
     * Reloads an Inhibitor.
     * @param {string} id - ID of the Inhibitor.
     */
    reloadInhibitor(id){
        let inhibitor = this.inhibitors.get(id);
        if (!inhibitor) throw new Error(`Inhibitor ${id} does not exist.`);

        let filepath = inhibitor.filepath;

        delete require.cache[require.resolve(inhibitor.filepath)];
        this.inhibitors.delete(inhibitor.id);
        
        this.loadInhibitor(filepath);
    }

    /**
     * Handles a Message.
     * @param {Discord.Message} message - Message to handle.
     * @param {string} prefix - Prefix for command.
     * @param {boolean} allowMention - Allow mentions to the client user as a prefix.
     * @param {boolean} disableBuiltIn - Disables the built-in command inhibitors.
     */
    handle(message, prefix, allowMention, disableBuiltIn){
        let start;
        let mentionRegex = new RegExp(`^<@!?${this.framework.client.user.id}>`);
        let mentioned = message.content.match(mentionRegex);

        if (message.content.startsWith(prefix)){
            start = prefix;
        } else
        if (allowMention && mentioned){
            start = mentioned[0];
        } else {
            return this.emit('commandPrefixInvalid', message);
        }

        let firstWord = message.content.replace(start, '').search(/\S/) + start.length;
        let name = message.content.slice(firstWord).split(' ')[0];
        let command = this.findCommand(name);

        if (!command) return this.emit('commandInvalid', message);

        let block = reason => {
            this.emit('commandBlocked', message, command, reason);
        };

        if (!disableBuiltIn){
            if (message.author.id !== this.framework.client.user.id && this.framework.options.selfbot) return block('notSelf');
            if (message.author.id === this.framework.client.user.id && !this.framework.options.selfbot) return block('client');
            if (message.author.bot) return block('bot');
            if (command.options.ownerOnly && message.author.id !== this.framework.options.ownerID) return block('owner');
            if (command.options.channelRestriction === 'guild' && !message.guild) return block('guild');
            if (command.options.channelRestriction === 'dm' && message.guild) return block('dm');
        }

        let results = [];

        this.inhibitors.forEach(inhibitor => {
            let inhibited = inhibitor.exec(message, command);

            if (inhibited instanceof Promise){
                return results.push(inhibited.catch(() => { throw inhibitor.reason; }));
            }

            if (!inhibited){
                return results.push(Promise.resolve());
            }

            results.push(Promise.reject(inhibitor.reason));
        });

        Promise.all(results).then(() => {
            let content = message.content.slice(message.content.indexOf(name) + name.length + 1);
            let args = command.parse(content);

            this.emit('commandStarted', message, command);
            let end = Promise.resolve(command.exec(message, args));

            end.then(() => {
                this.emit('commandFinished', message, command);
            }).catch(err => {
                this.emit('commandFinished', message, command);
                throw err;
            });
        }).catch(reason => {
            if (reason instanceof Error) throw reason;
            block(reason);
        });
    }
}

module.exports = CommandHandler;

/**
 * Emitted when a message does not start with the prefix.
 * @event CommandHandler#commandPrefixInvalid
 * @param {Discord.Message} message Message sent.
 */

/**
 * Emitted when a message does not match a command.
 * @event CommandHandler#commandInvalid
 * @param {Discord.Message} message Message sent.
 */

/**
 * Emitted when a command is blocked by an inhibitor.
 * @event CommandHandler#commandBlocked
 * @param {Discord.Message} message Message sent.
 * @param {Command} command Command blocked.
 * @param {string} reason Reason for the block.
 */

/**
 * Emitted when a command starts execution.
 * @event CommandHandler#commandStarted
 * @param {Discord.Message} message Message sent.
 * @param {Command} command Command executed.
 */

/**
 * Emitted when a command finishes execution.
 * @event CommandHandler#commandFinished
 * @param {Discord.Message} message Message sent.
 * @param {Command} command Command executed.
 */