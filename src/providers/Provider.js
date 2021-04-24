const AkairoError = require('../util/AkairoError');
const { Collection } = require('discord.js');

/**
 * A provider for key-value storage.
 * Must be implemented.
 */
class Provider {
    constructor() {
        /**
         * Cached entries.
         * @type {Collection<string, Object>}
         */
        this.items = new Collection();
    }

    /**
     * Initializes the provider.
     * @abstract
     * @returns {any}
     */
    init() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'init');
    }

    /**
     * Gets a value.
     * @abstract
     * @param {string} id - ID of entry.
     * @param {string} key - The key to get.
     * @param {any} [defaultValue] - Default value if not found or null.
     * @returns {any}
     */
    get() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'get');
    }

    /**
     * Sets a value.
     * @abstract
     * @param {string} id - ID of entry.
     * @param {string} key - The key to set.
     * @param {any} value - The value.
     * @returns {any}
     */
    set() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'set');
    }

    /**
     * Deletes a value.
     * @abstract
     * @param {string} id - ID of entry.
     * @param {string} key - The key to delete.
     * @returns {any}
     */
    delete() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'delete');
    }

    /**
     * Clears an entry.
     * @abstract
     * @param {string} id - ID of entry.
     * @returns {any}
     */
    clear() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'clear');
    }
}

module.exports = Provider;

/**
 * Options to use for providers.
 * @typedef {Object} ProviderOptions
 * @prop {string} [idColumn='id'] - Column for the unique key, defaults to 'id'.
 * @prop {string} [dataColumn] - Column for JSON data.
 * If not provided, the provider will use all columns of the table.
 * If provided, only one column will be used, but it will be more flexible due to being parsed as JSON.
 * For Sequelize, note that the model has to specify the type of the column as JSON or JSONB.
 */
