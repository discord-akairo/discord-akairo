const { Client } = require('discord.js');
const ClientUtil = require('./ClientUtil');
const CommandHandler = require('./CommandHandler');
const InhibitorHandler = require('./InhibitorHandler');
const ListenerHandler = require('./ListenerHandler');

/**
 * The Akairo framework client.
 * Creates the handlers and sets them up.
 * @param {AkairoOptions} [options={}] - Options to use for the framework.
 * @param {ClientOptions} [clientOptions] - Options for Discord JS client.
 * If not specified, the previous options parameter is used instead.
 */
class AkairoClient extends Client {
    constructor(options = {}, clientOptions) {
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
        if (this.selfbot) {
            console.log('Akairo: Selfbots are no longer supported.'); // eslint-disable-line no-console
        }

        /**
         * An empty object.
         * Useful for storing things.
         * @deprecated Extend the class
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
         * @deprecated Use providers
         * @type {Object}
         */
        this.databases = {};

        /**
         * Options for the framework.
         * @type {AkairoOptions}
         */
        this.akairoOptions = options;

        this._built = false;
        this._loaded = false;
    }

    /**
     * Adds a database that will be initialized once ready.
     * @deprecated Use providers
     * @param {string} name - Name of database.
     * @param {SQLiteHandler} database - The database.
     * @returns {AkairoClient}
     */
    addDatabase(name, database) {
        this.databases[name] = database;
        Object.defineProperty(database, 'client', {
            value: this
        });

        if (!this.akairoOptions.emitters) this.akairoOptions.emitters = {};
        this.akairoOptions.emitters[name] = database;

        return this;
    }

    /**
     * Logins the client, creates message listener, and initialize databases.
     * Resolves once client is ready.
     * @param {string} token - Client token.
     * @returns {Promise<string>}
     */
    login(token) {
        return new Promise((resolve, reject) => {
            if (!this._built) this.build();
            if (!this._loaded) this.loadAll();

            super.login(token).catch(reject);

            this.once('ready', () => {
                const promises = [];

                for (const key of Object.keys(this.databases)) {
                    const db = this.databases[key];
                    const ids = (db.init && db.init(this)) || [];
                    promises.push(db.load ? db.load(ids) : Promise.resolve());
                }

                Promise.all(promises).then(() => {
                    if (this.commandHandler) {
                        this.on('message', m => {
                            this.commandHandler.handle(m, false);
                        });

                        if (this.commandHandler.handleEdits) {
                            this.on('messageUpdate', (o, m) => {
                                if (o.content === m.content) return;
                                if (this.commandHandler.handleEdits) this.commandHandler.handle(m, true);
                            });
                        }
                    }

                    return resolve(token);
                }).catch(reject);
            });
        });
    }

    /**
     * Builds the client by creating the handlers.
     * @returns {AkairoClient}
     */
    build() {
        if (this._built) {
            throw new Error('Client handlers can only be built once.');
        }

        this._built = true;

        if (this.akairoOptions.commandDirectory && !this.commandHandler) {
            /**
             * The command handler.
             * @type {CommandHandler}
             */
            this.commandHandler = new CommandHandler(this, this.akairoOptions);
        }

        if (this.akairoOptions.inhibitorDirectory && !this.inhibitorHandler) {
            /**
             * The inhibitor handler.
             * @type {InhibitorHandler}
             */
            this.inhibitorHandler = new InhibitorHandler(this, this.akairoOptions);
        }

        if (this.akairoOptions.listenerDirectory && !this.listenerHandler) {
            /**
             * The listener handler.
             * @type {ListenerHandler}
             */
            this.listenerHandler = new ListenerHandler(this, this.akairoOptions);
        }

        return this;
    }

    /**
     * Calls `loadAll()` on the handlers.
     * @returns {void}
     */
    loadAll() {
        if (this._loaded) {
            throw new Error('Client modules can only be loaded once.');
        }

        this._loaded = true;

        if (this.listenerHandler) this.listenerHandler.loadAll();
        if (this.commandHandler) this.commandHandler.loadAll();
        if (this.inhibitorHandler) this.inhibitorHandler.loadAll();
    }
}

module.exports = AkairoClient;


/**
 * Options used to determine how the framework behaves.
 * @typedef {Object} AkairoOptions
 * @prop {string|string[]} [ownerID=''] - Discord ID of the client owner(s).
 * @prop {boolean} [selfbot=false] - Whether or not this bot is a selfbot.
 * @prop {string} [commandDirectory] - Directory to commands.
 * @prop {string|string[]|PrefixFunction} [prefix='!'] - Default command prefix(es).
 * @prop {boolean|AllowMentionFunction} [allowMention=true] - Whether or not to allow mentions to the client user as a prefix.
 * @prop {boolean} [handleEdits=false] - Whether or not to handle edited messages.
 * @prop {boolean} [commandUtil=false] - Whether or not to assign `message.util`.
 * Set to `true` by default if `handleEdits` is on.
 * @prop {number} [commandUtilLifetime=0] - Milliseconds a command util should last before it is removed.
 * If 0, command utils will never be removed.
 * @prop {boolean} [fetchMembers=false] - Whether or not to fetch member on each message from a guild.
 * @prop {number} [defaultCooldown=0] - The default cooldown for commands.
 * @prop {ArgumentPromptOptions} [defaultPrompt] - The default prompt options.
 * @prop {string} [inhibitorDirectory] - Directory to inhibitors.
 * @prop {boolean} [blockNotSelf=true] - Whether or not to block others, if a selfbot.
 * @prop {boolean} [blockClient=true] - Whether or not to block self, if not a selfbot.
 * @prop {boolean} [blockBots=true] - Whether or not to block bots.
 * @prop {string} [listenerDirectory] - Directory to listeners.
 * @prop {Object} [emitters={}] - Emitters to load onto the listener handler.
 * @prop {boolean} [automateCategories=false] - Whether or not to set each module's category to it's parent directory name
 */

/**
 * A function that returns the prefix(es) to use.
 * @typedef {Function} PrefixFunction
 * @param {Message} message - Message to get prefix for.
 * @returns {string|string[]}
 */

/**
 * A function that returns whether mentions can be used as a prefix.
 * @typedef {Function} AllowMentionFunction
 * @param {Message} message - Message to option for.
 * @returns {boolean}
 */
