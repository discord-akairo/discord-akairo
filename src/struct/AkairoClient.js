const { Client } = require('discord.js');
const CommandHandler = require('./CommandHandler');
const InhibitorHandler = require('./InhibitorHandler');
const ListenerHandler = require('./ListenerHandler');
const ClientUtil = require('../utils/ClientUtil');

/**
 * Options used to determine how the framework behaves.
 * This is also passed to Discord JS's client options.
 * @typedef {Object} AkairoOptions
 * @prop {string} [ownerID=''] - Discord ID of the client owner. Defines client.ownerID.
 * @prop {boolean} [selfbot=false] - Marks this bot as a selfbot. Defines client.selfbot.
 * @prop {string} [commandDirectory] - Directory to commands.
 * @prop {string|function} [prefix='!'] - Default command prefix or function <code>(message => {})</code> returning prefix.
 * @prop {boolean|function} [allowMention=true] - Allow mentions to the client user as a prefix or function <code>(message => {})</code> that returns true or false.
 * @prop {string} [inhibitorDirectory] - Directory to inhibitors.
 * @prop {boolean} [preInhibitors=false] - Disables the built-in pre-message inhibitors.
 * @prop {boolean} [postInhibitors=false] - Disables the built-in post-message inhibitors.
 * @prop {string} [listenerDirectory] - Directory to listeners.
 * @prop {Object} [emitters={}] - Emitters to load onto the listener handler.
 */

class AkairoClient extends Client {
    /**
     * The Akairo client. Creates the handlers and sets them up.
     * @param {AkairoOptions} options - Options to use for the framework and the client.
     */
    constructor(options = {}){
        super(options);

        /**
         * The ID of the owner.
         * @type {string}
         */
        this.ownerID = options.ownerID;

        /**
         * Whether or not this is a selfbot.
         * @type {boolean}
         */
        this.selfbot = !!options.selfbot;

        /**
         * Utility methods.
         * @type {ClientUtil}
         */
        this.util = new ClientUtil(this.client);

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
            super.login(token).catch(reject);
            this.once('ready', resolve);

            if (this.commandHandler) this.on('message', m => { this.commandHandler.handle(m); });
        });
    }
}

module.exports = AkairoClient;
