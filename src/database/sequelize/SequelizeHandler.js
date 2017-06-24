const { Collection } = require('discord.js');

/**
 * Options to use for the SequelizeHandler.
 * @typedef {Object} SequelizeHandlerOptions
 * @prop {Object} [defaultConfig={}] - Default configuration.
 * @prop {string[]|DatabaseInitFunction} [init=[]] - IDs to use to initialize database.
 * If you want to load the database before login, use `SequelizeHandler#load`.
 */

class SequelizeHandler {
    /**
     * Wrapper around a Sequelize Model.
     * @param {Model} model - Model class.
     * @param {SequelizeHandlerOptions} [options={}] - Options for handler.
     */
    constructor(model, options = {}) {
        /**
         * The Sequelize model.
         * @type {Model}
         */
        this.model = model;

        /**
         * Configurations stored in memory, mapped by ID to configuration.
         * @type {Collection<string, Object>}
         */
        this.memory = new Collection();

        /**
         * Default configuration.
         * @type {Object}
         */
        this.defaultConfig = options.defaultConfig || {};

        /**
         * Returns an array of IDs.
         * @method
         * @param {AkairoClient} client - Client to use.
         * @returns {string[]}
         */
        this.init = typeof options.init === 'function' ? options.init : () => options.init;
    }

    /**
     * Array of IDs.
     * Note that this calls the Collection's `keyArray()`.
     * @type {string[]}
     */
    get ids() {
        return this.memory.keyArray();
    }

    /**
     * Array of configs.
     * Note that this calls the Collection's `array()`.
     * @type {string[]}
     */
    get configs() {
        return this.memory.array();
    }

    /**
     * Loads the table.
     * Returns newly inserted IDs.
     * @param {string[]} ids - IDs to initialize with.
     * @returns {Promise<string[]>}
     */
    load(ids) {
        return this.model.sync().then(() => {
            return this.model.all();
        }).then(rows => {
            for (const row of rows) {
                this.memory.set(row.get('id'), row.dataValues);
            }

            const insert = ids.filter(id => !this.memory.has(id));
            return this.model.bulkCreate(insert.map(id => ({ id }))).then(() => {
                return insert;
            });
        });
    }

    /**
     * Syncs with the model.
     * @param {Object} [query] - Sequelize query.
     * @returns {Promise<void>}
     */
    reload(query = {}) {
        return this.model.findAll(query).then(rows => {
            for (const row of rows) {
                this.memory.set(row.get('id'), row.dataValues);
            }
        });
    }

    /**
     * Adds a new entry.
     * @param {string} id - ID to add.
     * @returns {Promise<Object>}
     */
    add(id) {
        if (this.has(id)) return Promise.reject(new Error(`${id} already exists`));

        return this.model.create({ id }).then(row => {
            this.memory.set(row.get('id'), row.dataValues);
            return this.get(row.get('id'));
        });
    }

    /**
     * Removes an entry.
     * @param {string} id - ID to remove.
     * @returns {Promise<Object>}
     */
    remove(id) {
        if (!this.has(id)) return Promise.reject(new Error(`${id} does not exist`));

        return this.model.destroy({ where: { id } }).then(() => {
            const old = this.memory.get(id);
            this.memory.delete(id);
            return old;
        });
    }

    /**
     * Checks if an ID exists.
     * @param {string} id - ID to check.
     * @returns {boolean}
     */
    has(id) {
        return this.memory.has(id);
    }

    /**
     * Gets a configuration with defaults accounted for.
     * @param {string} id - ID of configuration.
     * @returns {Object}
     */
    get(id) {
        const copy = {};
        const config = this.memory.get(id) || this.defaultConfig;

        for (const key of Object.keys(config)) {
            if (config[key] == null) {
                copy[key] = this.defaultConfig[key];
                continue;
            }

            copy[key] = config[key];
        }

        return copy;
    }

    /**
     * Sets a key-value pair for an entry.
     * @param {string} id - ID of entry.
     * @param {string} key - Key to change.
     * @param {any} value - Value to set to.
     * @returns {Promise<Object>}
     */
    set(id, key, value) {
        if (!this.has(id)) return Promise.reject(new Error(`${id} does not exist`));

        const config = this.memory.get(id);
        if (!config.hasOwnProperty(key)) return Promise.reject(new Error(`Key ${key} does not exist for ${id}`));

        return this.model.update({ [key]: value }, { where: { id } }).then(() => {
            config[key] = value;
            return config;
        });
    }
}

module.exports = SequelizeHandler;
