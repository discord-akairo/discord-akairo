const AkairoError = require('../util/AkairoError');
const { Client } = require('discord.js');
const ClientUtil = require('./ClientUtil');
const CommandHandler = require('./CommandHandler');
const InhibitorHandler = require('./InhibitorHandler');
const ListenerHandler = require('./ListenerHandler');

/**
 * Options used to determine how the framework behaves.
 * @typedef {Object} AkairoOptions
 * @prop {string} [commandDirectory] - Directory to commands.
 * @prop {Snowflake|Snowflake[]} [ownerID=''] - Discord ID of the client owner(s).
 * @prop {boolean} [selfbot=false] - Whether or not this bot is a selfbot.
 * @prop {string|string[]|PrefixFunction} [prefix='!'] - Default command prefix(es).
 * @prop {boolean|AllowMentionFunction} [allowMention=true] - Whether or not to allow mentions to the client user as a prefix.
 * @prop {RegExp} [aliasReplacement] - Regular expression to automatically make command aliases.
 * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
 * So, the alias `command-name` is valid as both `command-name` and `commandname`.
 * @prop {boolean} [handleEdits=false] - Whether or not to handle edited messages.
 * @prop {boolean} [commandUtil=false] - Whether or not to assign `message.util`.
 * Set to `true` by default if `handleEdits` is on.
 * @prop {boolean} [storeMessages=false] - Whether or not to have CommandUtil store all prompts and their replies.
 * @prop {number} [commandUtilLifetime=0] - Milliseconds a command util should last before it is removed.
 * If 0, CommandUtil instances will never be removed.
 * @prop {boolean} [fetchMembers=false] - Whether or not to fetch member on each message from a guild.
 * @prop {number} [defaultCooldown=0] - The default cooldown for commands.
 * @prop {Snowflake|Snowflake[]} [ignoreCooldownID] - ID of user(s) to ignore cooldown.
 * Defaults to the client owner(s) option.
 * @prop {ArgumentPromptOptions} [defaultPrompt] - The default prompt options.
 * @prop {string} [inhibitorDirectory] - Directory to inhibitors.
 * @prop {boolean} [blockOthers=true] - Whether or not to block others, if a selfbot.
 * @prop {boolean} [blockClient=true] - Whether or not to block self, if not a selfbot.
 * @prop {boolean} [blockBots=true] - Whether or not to block bots.
 * @prop {string} [listenerDirectory] - Directory to listeners.
 * @prop {Object} [emitters={}] - Emitters to load onto the listener handler.
 * @prop {boolean} [automateCategories=false] - Whether or not to set each module's category to its parent directory name.
 * @prop {LoadFilterFunction} [loadFilter] - Filter for files to be loaded.
 * Can be set individually for each handler by overriding the `loadAll` method.
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

class AkairoClient extends Client {
    /**
     * The Akairo framework client.
     * Creates the handlers and sets them up.
     * @param {AkairoOptions} [options={}] - Options to use for the framework.
     * @param {ClientOptions} [clientOptions] - Options for Discord JS client.
     * If not specified, the previous options parameter is used instead.
     */
    constructor(options = {}, clientOptions) {
        super(clientOptions || options);

        const {
            ownerID = '',
            selfbot = false
        } = options;

        /**
         * The ID of the owner(s).
         * @type {Snowflake|Snowflake[]}
         */
        this.ownerID = ownerID;

        /**
         * Whether or not this is a selfbot.
         * @type {boolean}
         */
        this.selfbot = Boolean(selfbot);

        /**
         * Utility methods.
         * @type {ClientUtil}
         */
        this.util = new ClientUtil(this);

        /**
         * Options for the framework.
         * @type {AkairoOptions}
         */
        this.akairoOptions = options;

        /**
         * Whether or not handlers are built.
         * @protected
         * @type {boolean}
         */
        this._built = false;

        /**
         * Whether or not modules are loaded.
         * @protected
         * @type {boolean}
         */
        this._loaded = false;
    }

    /**
     * Builds the client by creating the handlers.
     * @returns {AkairoClient}
     */
    build() {
        if (this._built) {
            throw new AkairoError('BUILD_ONCE');
        }

        this._built = true;

        if (this.akairoOptions.commandDirectory && !this.commandHandler) {
            /**
             * The command handler.
             * @type {CommandHandler}
             */
            this.commandHandler = new CommandHandler(this);
        }

        if (this.akairoOptions.inhibitorDirectory && !this.inhibitorHandler) {
            /**
             * The inhibitor handler.
             * @type {InhibitorHandler}
             */
            this.inhibitorHandler = new InhibitorHandler(this);
        }

        if (this.akairoOptions.listenerDirectory && !this.listenerHandler) {
            /**
             * The listener handler.
             * @type {ListenerHandler}
             */
            this.listenerHandler = new ListenerHandler(this);
        }

        return this;
    }

    /**
     * Calls `loadAll()` on the handlers.
     * @returns {AkairoClient}
     */
    loadAll() {
        if (this._loaded) {
            throw new AkairoError('LOAD_ONCE');
        }

        this._loaded = true;

        if (this.listenerHandler) this.listenerHandler.loadAll();
        if (this.commandHandler) this.commandHandler.loadAll();
        if (this.inhibitorHandler) this.inhibitorHandler.loadAll();

        return this;
    }

    /**
     * Logins the client and builds the client.
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
                if (this.commandHandler) {
                    this.on('message', m => {
                        this.commandHandler.handle(m);
                    });

                    if (this.commandHandler.handleEdits) {
                        this.on('messageUpdate', (o, m) => {
                            if (o.content === m.content) return;
                            if (this.commandHandler.handleEdits) this.commandHandler.handle(m);
                        });
                    }
                }

                return resolve(token);
            });
        });
    }
}

module.exports = AkairoClient;
