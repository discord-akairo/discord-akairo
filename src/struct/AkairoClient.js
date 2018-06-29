const { Client } = require('discord.js');
const ClientUtil = require('./ClientUtil');

/**
 * Options for the client.
 * @typedef {Object} AkairoOptions
 * @prop {Snowflake|Snowflake[]} [ownerID=''] - Discord ID of the client owner(s).
 */

class AkairoClient extends Client {
    /**
     * The Akairo framework client.
     * Creates the handlers and sets them up.
     * @param {AkairoOptions} [options={}] - Options for the client.
     * @param {ClientOptions} [clientOptions] - Options for Discord JS client.
     * If not specified, the previous options parameter is used instead.
     */
    constructor(options = {}, clientOptions) {
        super(clientOptions || options);

        const { ownerID = '' } = options;

        /**
         * The ID of the owner(s).
         * @type {Snowflake|Snowflake[]}
         */
        this.ownerID = ownerID;

        /**
         * Utility methods.
         * @type {ClientUtil}
         */
        this.util = new ClientUtil(this);
    }
}

module.exports = AkairoClient;
