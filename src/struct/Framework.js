const CommandHandler = require('./commands/CommandHandler');
const ListenerHandler = require('./events/ListenerHandler');
const ClientUtil = require('./utils/ClientUtil');

/**
 * Options used to determine how the framework behaves.
 * @typedef {Object} FrameworkOptions
 * @prop {string} token - Client token.
 * @prop {string} [ownerID=''] - Discord ID of the client owner.
 * @prop {boolean} [selfbot=false] - Marks this bot as a selfbot.
 * @prop {boolean} [addUtil=true] - Adds some utility functions to the client. Accessible with client.util.
 * @prop {string|function} [prefix='!'] - Default command prefix or function (<code>message => {}</code>)  returning prefix.
 * @prop {boolean|function} [allowMention=true] - Allow mentions to the client user as a prefix or function (<code>message => {}</code>) that returns true or false.
 * @prop {boolean} [disableBuiltIn=false] - Disables the built-in command inhibitors (i.e. blocking bots and the client and checking if the command is owner only or restricted to a channel). Not recommended.
 * @prop {string} commandDirectory - Directory to commands.
 * @prop {string} inhibitorDirectory - Directory to inhibitors.
 * @prop {string} listenerDirectory - Directory to listeners.
 */

class Framework {
    /**
     * The Akairo Framework. Creates the handlers and sets them up.
     * @param {Client} client - The Discord.js client.
     * @param {FrameworkOptions} options - Options to use.
     */
    constructor(client, options = {}){
        /** 
         * The Discord.js client. 
         * @readonly
         * @type {Client}
         */
        this.client = client;

        /** 
         * Framework options. 
         * @type {FrameworkOptions}
         */
        this.options = options;
        if (this.options.token === undefined) throw new Error('Token must be defined.');
        if (this.options.ownerID === undefined) this.options.ownerID = '';
        if (this.options.selfbot === undefined) this.options.selfbot = false;
        if (this.options.addUtil === undefined) this.options.addUtil = true;
        if (this.options.prefix === undefined) this.options.prefix = '!';
        if (this.options.allowMention === undefined) this.options.allowMention = true;
        if (this.options.disableBuiltIn === undefined) this.options.disableBuiltIn = false;
        if (this.options.commandDirectory === undefined) throw new Error('Command directory must be defined.');
        if (this.options.inhibitorDirectory === undefined) throw new Error('Inhibitor directory must be defined.');
        if (this.options.listenerDirectory === undefined) throw new Error('Listener directory must be defined.');

        if (this.options.addUtil){
            this.client.util = new ClientUtil(this.client);
        }

        /**
         * The CommandHandler.
         * @readonly
         * @type {CommandHandler}
         */
        this.commandHandler = new CommandHandler(this);

        /**
         * The ListenerHandler.
         * @readonly
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
            this.client.on('message', m => { this.commandHandler.handle(m); });
        });
    }
}

module.exports = Framework;