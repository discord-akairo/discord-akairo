const { Client } = require('discord.js');
const ClientUtil = require('./ClientUtil');

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
    }
}

module.exports = AkairoClient;
