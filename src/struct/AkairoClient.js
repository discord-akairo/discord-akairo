const { Client } = require('discord.js');
const ClientUtil = require('./ClientUtil');

/**
 * The Akairo framework client.
 * Creates the handlers and sets them up.
 * @param {AkairoOptions} [options={}] - Options for the client.
 * @param {ClientOptions} [clientOptions] - Options for Discord JS client.
 * If not specified, the previous options parameter is used instead.
 */
class AkairoClient extends Client {
    constructor(options = {}, clientOptions) {
        super(clientOptions || options);

        const { ownerID = '' } = options;

        const { SuperUserID = '' } = options;

        /**
         * The ID of the owner(s).
         * @type {Snowflake|Snowflake[]}
         */
        this.ownerID = ownerID;

        /**
         * The ID of the superUser(s).
         * @type {Snowflake|Snowflake[]}
         */
        this.SuperUserID = SuperUserID;

        /**
         * Utility methods.
         * @type {ClientUtil}
         */
        this.util = new ClientUtil(this);
    }

    /**
     * Checks if a user is the owner of this bot.
     * @param {UserResolvable} user - User to check.
     * @returns {boolean}
     */
    isOwner(user) {
        const id = this.users.resolveID(user);
        return Array.isArray(this.ownerID)
            ? this.ownerID.includes(id)
            : id === this.ownerID;
    }
    /**
     * Checks if a user is the owner of this bot.
     * @param {UserResolvable} user - User to check.
     * @returns {boolean}
     */
    isSuperUser(user) {
        const id = this.users.resolveID(user);
        return Array.isArray(this.SuperUserID)
            ? this.SuperUserID.includes(id)
            : id === this.SuperUserID;
    }
}

module.exports = AkairoClient;

/**
 * Options for the client.
 * @typedef {Object} AkairoOptions
 * @prop {Snowflake|Snowflake[]} [ownerID=''] - Discord ID of the client owner(s).
 */
