const CommandHandler = require('./commands/CommandHandler');
const InhibitorHandler = require('./inhibitors/InhibitorHandler');
const ListenerHandler = require('./listeners/ListenerHandler');
const ClientUtil = require('./utils/ClientUtil');

/**
 * Options used to determine how the framework behaves.
 * @typedef {Object} FrameworkOptions
 * @prop {string} [ownerID=''] - Discord ID of the client owner. Defines client.ownerID.
 * @prop {boolean} [selfbot=false] - Marks this bot as a selfbot. Defines client.selfbot.
 * @prop {string} [commandDirectory] - Directory to commands.
 * @prop {string|function} [prefix='!'] - Default command prefix or function <code>(message => {})</code> returning prefix.
 * @prop {boolean|function} [allowMention=true] - Allow mentions to the client user as a prefix or function <code>(message => {})</code> that returns true or false.
 * @prop {string} [inhibitorDirectory] - Directory to inhibitors.
 * @prop {boolean} [disablePreInhib=false] - Disables the built-in pre-message inhibitors.
 * @prop {boolean} [disablePostInhib=false] - Disables the built-in post-message inhibitors.
 * @prop {string} [listenerDirectory] - Directory to listeners.
 * @prop {Object} [emitters] - Emitters to load onto the listener handler.
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

        this.client.ownerID = options.ownerID;
        this.client.selfbot = !!options.selfbot;
        this.client.util = new ClientUtil(this.client);

        if (options.commandDirectory){
            /**
             * The command handler.
             * @readonly
             * @type {CommandHandler}
             */
            this.commandHandler = new CommandHandler(this, options);
        }

        if (options.inhibitorDirectory){
            /**
             * The inhibitor handler.
             * @readonly
             * @type {InhibitorHandler}
             */
            this.inhibitorHandler = new InhibitorHandler(this, options);
        }

        if (options.listenerDirectory){
            /**
             * The listener handler.
             * @readonly
             * @type {ListenerHandler}
             */
            this.listenerHandler = new ListenerHandler(this, options);
        }
    }

    /**
     * Logins the client and creates a listener on client message event. Resolves once client is ready.
     * @param {string} token - Client token.
     * @returns {Promise}
     */
    login(token){
        return new Promise((resolve, reject) => {
            this.client.login(token).catch(reject);
            this.client.once('ready', resolve);

            if (this.commandHandler) this.client.on('message', m => { this.commandHandler.handle(m); });
        });
    }
}

module.exports = Framework;
