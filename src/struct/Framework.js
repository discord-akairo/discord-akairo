const CommandHandler = require('./commands/CommandHandler');
const ListenerHandler = require('./events/ListenerHandler');
const ClientUtil = require('./utils/ClientUtil');

/**
 * Options used to determine how the framework behaves.
 * @typedef {Object} FrameworkOptions
 * @prop {string} token - Client token.
 * @prop {string} ownerID - Discord ID of the client owner.
 * @prop {boolean} [selfbot=false] - Marks this bot as a selfbot.
 * @prop {boolean} [addUtil=false] - Adds to the client a bunch of utility functions. Accessible with client.util.
 * @prop {(string|function)} [prefix='!'] - Default command prefix or function returning prefix.
 * @prop {(boolean|function)} [allowMention=false] - Allow mentions to the client user as a prefix or function that returns true or false.
 * @prop {string} commandDirectory - Directory to commands.
 * @prop {string} inhibitorDirectory - Directory to inhibitors.
 * @prop {string} listenerDirectory - Directory to listeners.
 */

class Framework {
    /**
     * Creates a new Framework.
     * @param {Discord.Client} client - The Discord.js client.
     * @param {FrameworkOptions} options - Options to use.
     */
    constructor(client, options = {}){
        /** 
         * The Discord.js client. 
         * @type {Discord.Client}
         */
        this.client = client;

        /** 
         * Framework options. 
         * @type {FrameworkOptions}
         */
        this.options = options;
        if (this.options.token === undefined) throw new Error('Token must be defined.');
        if (this.options.selfbot === undefined) this.options.selfbot = false;
        if (this.options.addUtil === undefined) this.options.addUtil = false;
        if (this.options.prefix === undefined) this.options.prefix = '!';
        if (this.options.allowMention === undefined) this.options.allowMention = false;
        if (this.options.commandDirectory === undefined) throw new Error('Command directory must be defined.');
        if (this.options.inhibitorDirectory === undefined) throw new Error('Inhibitor directory must be defined.');
        if (this.options.listenerDirectory === undefined) throw new Error('Listener directory must be defined.');

        if (this.options.addUtil){
            this.client.util = new ClientUtil(this);
        }

        /**
         * The CommandHandler.
         * @type {CommandHandler}
         */
        this.commandHandler = new CommandHandler(this);

        /**
         * The ListenerHandler.
         * @type {ListenerHandler}
         */
        this.listenerHandler = new ListenerHandler(this);
    }

    /**
     * Logins the client and creates a listener on client message event. Resolves once client is ready.
     * @returns {Promise}
     */
    login(){
        return new Promise((resolve, reject) => {
            this.client.login(this.options.token).catch(reject);
            this.client.once('ready', resolve);

            this.client.on('message', message => {
                let prefix;
                let allowMention;

                if (typeof this.options.prefix === 'function'){
                    prefix = this.options.prefix(message) || '!';
                } else {
                    prefix = this.options.prefix || '!';
                }

                if (typeof this.options.allowMention === 'function'){
                    allowMention = this.options.allowMention(message) || false;
                } else {
                    allowMention = this.options.allowMention || false;
                }

                this.commandHandler.handle(message, prefix, allowMention);
            });
        });
    }
}

module.exports = Framework;