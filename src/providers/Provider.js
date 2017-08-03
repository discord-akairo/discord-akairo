const { Collection } = require('discord.js');

class Provider {
    /**
     * A provider for key-value storage.
     */
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
        throw new TypeError(`${this.constructor.name}#init has not been implemented`);
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
        throw new TypeError(`${this.constructor.name}#get has not been implemented`);
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
        throw new TypeError(`${this.constructor.name}#set has not been implemented`);
    }

    /**
     * Deletes a value.
     * @abstract
     * @param {string} id - ID of entry.
     * @param {string} key - The key to delete.
     * @returns {any}
     */
    delete() {
        throw new TypeError(`${this.constructor.name}#delete has not been implemented`);
    }

    /**
     * Clears an entry.
     * @abstract
     * @param {string} id - ID of entry.
     * @returns {any}
     */
    clear() {
        throw new TypeError(`${this.constructor.name}#clear has not been implemented`);
    }
}

module.exports = Provider;
