const CommandHandler = require('./commands/CommandHandler');
const ListenerHandler = require('./events/ListenerHandler');

/**
 * @typedef {Object} FrameworkOptions
 * A set of options used to determine what the framework does.
 * @prop {string} token - Client token.
 * @prop {string} ownerID - Discord ID of the client owner.
 * @prop {boolean} selfbot - Marks this bot as a selfbot.
 * @prop {string} prefix - Default command prefix or function returning prefix.
 * @prop {boolean} allowMention - Allows mentions to the client user as a prefix.
 * @prop {string} commandDirectory - Directory to commands.
 * @prop {string} inhibitorDirectory - Directory to inhibitors.
 * @prop {string} listenerDirectory - Directory to listeners.
 */

class Framework {
    /**
     * Creates a new Framework.
     * @param {Discord.Client} client The Discord.js client.
     * @param {FrameworkOptions} options Options to use.
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
        if (this.options.prefix === undefined) this.options.prefix = '!';
        if (this.options.allowMention === undefined) this.options.allowMention = false;
        if (this.options.commandDirectory === undefined) throw new Error('Command directory must be defined.');
        if (this.options.inhibitorDirectory === undefined) throw new Error('Inhibitor directory must be defined.');
        if (this.options.listenerDirectory === undefined) throw new Error('Listener directory must be defined.');

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

                if (typeof this.options.prefix === 'function'){
                    prefix = this.options.prefix(message) || '!';
                } else {
                    prefix = this.options.prefix || '!';
                }

                this.commandHandler.handle(message, prefix, this.options.allowMention);
            });
        });
    }
}

module.exports = Framework;