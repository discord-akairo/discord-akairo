const { Client } = require('discord.js');
const CommandHandler = require('./CommandHandler');
const InhibitorHandler = require('./InhibitorHandler');
const ListenerHandler = require('./ListenerHandler');
const ClientUtil = require('../util/ClientUtil');

/**
 * Options used to determine how the framework behaves.
 * @typedef {Object} AkairoOptions
 * @prop {string|string[]} [ownerID=''] - Discord ID of the client owner(s).
 * @prop {boolean} [selfbot=false] - Whether or not this bot is a selfbot.
 * @prop {string} [commandDirectory] - Directory to commands.
 * @prop {string|string[]|function} [prefix='!'] - Default command prefix(es) or function <code>(message => {})</code> returning prefix(es).
 * @prop {boolean|function} [allowMention=true] - Whether or not to allow mentions to the client user as a prefix.<br>Can be function <code>(message => {})</code> that returns true or false.
 * @prop {number} [defaultCooldown=0] - The default cooldown for commands.
 * @prop {PromptOptions} [defaultPrompt] - The default prompt options.
 * @prop {string} [cancelWord='cancel'] - Word to use to cancel a prompt.
 * @prop {string} [inhibitorDirectory] - Directory to inhibitors.
 * @prop {boolean} [preInhibitors=true] - Whether or not to enable the built-in pre-message inhibitors.
 * @prop {boolean} [postInhibitors=true] - Whether or not to enable the built-in post-message inhibitors.
 * @prop {string} [listenerDirectory] - Directory to listeners.
 * @prop {Object} [emitters={}] - Emitters to load onto the listener handler.
 */

class AkairoClient extends Client {
    /**
     * The Akairo framework client.<br>Creates the handlers and sets them up.
     * @param {AkairoOptions} [options={}] - Options to use for the framework.
     * @param {ClientOptions} [clientOptions] - Options for Discord JS client.<br>If not specified, the previous options parameter is used instead.
     */
    constructor(options = {}, clientOptions){
        super(clientOptions || options);

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
         * An empty object.<br>Do whatever you want to it.
         * @name AkairoClient#mem
         * @type {Object}
         */
        this.mem = {};

        /**
         * Utility methods.
         * @type {ClientUtil}
         */
        this.util = new ClientUtil(this);

        /**
         * Databases added.
         * @type {Object}
         */
        this.databases = {};

        this._options = options;
    }

    /**
     * Adds a database that will be initialized once ready.
     * @param {string} name - Name of database.
     * @param {SQLiteHandler} database - The database.
     */
    addDatabase(name, database){
        Object.defineProperty(this.databases, name, {
            value: database,
            enumerable: true
        });

        if (!this._options.emitters) this._options.emitters = {};
        this._options.emitters[name] = database;
    }

    /**
     * Logins the client, creates message listener, and init databases.<br>Resolves once client is ready.
     * @param {string} token - Client token.
     * @returns {Promise}
     */
    login(token){
        return new Promise((resolve, reject) => {
            this._build();
            super.login(token).catch(reject);

            this.once('ready', () => {
                const promises = Object.keys(this.databases).map(key => {
                    const ids = this.databases[key].init(this);
                    return this.databases[key].load(ids);
                });

                Promise.all(promises).then(() => resolve()).catch(reject);
            });

            if (this.commandHandler) this.on('message', m => { this.commandHandler.handle(m); });
        });
    }

    _build(){
        if (this._options.commandDirectory && !this.commandHandler){
            /**
             * The command handler.
             * @type {CommandHandler}
             */
            this.commandHandler = new CommandHandler(this, this._options);
        }

        if (this._options.inhibitorDirectory && !this.inhibitorHandler){
            /**
             * The inhibitor handler.
             * @type {InhibitorHandler}
             */
            this.inhibitorHandler = new InhibitorHandler(this, this._options);
        }

        if (this._options.listenerDirectory && !this.listenerHandler){
            /**
             * The listener handler.
             * @type {ListenerHandler}
             */
            this.listenerHandler = new ListenerHandler(this, this._options);
        }
    }
}

module.exports = AkairoClient;
