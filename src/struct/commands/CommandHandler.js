const path = require('path');
const EventEmitter = require('events');
const rread = require('readdir-recursive');
const Command = require('./Command');
const Inhibitor = require('./Inhibitor');

class CommandHandler extends EventEmitter {
    /**
     * Creates a new CommandHandler.
     * @param {Framework} framework The Akairo framework.
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
         * @type {Map.<string, Command>}
         */
        this.commands = new Map();

        /**
         * Inhibitors loaded, mapped by ID to Inhibitor.
         * @type {Map.<string, Inhibitor>}
         */
        this.inhibitors = new Map();

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
     * @param {string} filepath Path to file.
     */
    loadCommand(filepath){
        let command = require(filepath);

        if (!(command instanceof Command)) return;
        if (this.commands.has(command.id)) throw new Error(`Command ${command.id} already loaded.`);

        command.filepath = filepath;
        command.framework = this.framework;
        command.commandHandler = this;

        this.commands.set(command.id, command);
    }

    /**
     * Adds a Command.
     * @param {string} filename Filename to lookup in the directory.
     */
    addCommand(filename){
        let files = rread.fileSync(this.commandDirectory);
        let filepath = files.find(file => file.endsWith(`${filename}`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.loadCommand(filepath);
    }

    /**
     * Removes a Command.
     * @param {string} id ID of the Command.
     */
    removeCommand(id){
        let command = this.commands.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);

        delete require.cache[require.resolve(command.filepath)];
        this.commands.delete(command.id);
    }

    /**
     * Reloads a Command.
     * @param {string} id ID of the Command.
     */
    reloadCommand(id){
        let command = this.commands.get(id);
        if (!command) throw new Error(`Command ${id} does not exist.`);

        let filepath = command.filepath;

        delete require.cache[require.resolve(command.filepath)];
        this.commands.delete(command.id);
        
        this.loadCommand(filepath);
    }

    /**
     * Finds a command by alias.
     * @param {string} name Alias to find with.
     */
    findCommand(name){
        return Array.from(this.commands.values()).find(command => command.aliases.includes(name.toLowerCase()));
    }

    /**
     * Loads an Inhibitor.
     * @param {string} filepath Path to file.
     */
    loadInhibitor(filepath){
        let inhibitor = require(filepath);

        if (!(inhibitor instanceof Inhibitor)) return;
        if (this.inhibitors.has(inhibitor.id)) throw new Error(`Inhibitor ${inhibitor.id} already loaded.`);

        inhibitor.filepath = filepath;
        inhibitor.framework = this.framework;
        inhibitor.commandHandler = this;

        this.inhibitors.set(inhibitor.id, inhibitor);
    }

    /**
     * Adds an Inhibitor.
     * @param {string} filename Filename to lookup in the directory.
     */
    addInhibitor(filename){
        let files = rread.fileSync(this.inhibitorDirectory);
        let filepath = files.find(file => file.endsWith(`${filename}`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.loadInhibitor(filepath);
    }

    /**
     * Removes an Inhibitor.
     * @param {string} id ID of the Inhibitor.
     */
    removeInhibitor(id){
        let inhibitor = this.inhibitors.get(id);
        if (!inhibitor) throw new Error(`Inhibitor ${id} does not exist.`);

        delete require.cache[require.resolve(inhibitor.filepath)];
        this.inhibitors.delete(inhibitor.id);
    }

    /**
     * Reloads an Inhibitor.
     * @param {string} id ID of the Inhibitor.
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
     * @param {Discord.Message} message Message to handle.
     * @param {string} prefix Prefix for command.
     * @param {boolean} allowMention Allow mentions to the client user as a prefix.
     */
    handle(message, prefix, allowMention){
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

        if (message.author.id !== this.framework.client.user.id && this.framework.options.selfbot) return block('notSelf');
        if (message.author.id === this.framework.client.user.id && !this.framework.options.selfbot) return block('client');
        if (message.author.bot) return block('bot');
        if (command.options.ownerOnly && message.author.id !== this.framework.options.ownerID) return block('owner');
        if (command.options.channelRestriction === 'guild' && !message.guild) return block('guild');
        if (command.options.channelRestriction === 'dm' && message.guild) return block('dm');

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
 * @event CommandHandler#commandPrefixInvalid
 * Emitted when a message does not start with the prefix.
 * @param {Discord.Message} message Message sent.
 */

/**
 * @event CommandHandler#commandInvalid
 * Emitted when a message does not match a command.
 * @param {Discord.Message} message Message sent.
 */

/**
 * @event CommandHandler#commandBlocked
 * Emitted when a command is blocked by an inhibitor.
 * @param {Discord.Message} message Message sent.
 * @param {Command} command Command blocked.
 * @param {string} reason Reason for the block.
 */

/**
 * @event CommandHandler#commandStarted
 * Emitted when a command starts execution.
 * @param {Discord.Message} message Message sent.
 * @param {Command} command Command executed.
 */

/**
 * @event CommandHandler#commandFinished
 * Emitted when a command finishes execution.
 * @param {Discord.Message} message Message sent.
 * @param {Command} command Command executed.
 */