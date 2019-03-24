const { Collection } = require('discord.js');
const EventEmitter = require('events');
const { SQLiteHandlerEvents } = require('../util/Constants');
const path = require('path');

let sql;

/**
 * Creates an SQLiteHandler.
 * Tables must have an 'id' column.
 * @deprecated Use SQLiteProvider
 * @param {string} filepath - Path to .sqlite file.
 * @param {SQLiteOptions} [options={}] - Options for the handler.
 * @extends {EventEmitter}
 */
class SQLiteHandler extends EventEmitter {
    constructor(filepath, options = {}) {
        super();

        sql = require('sqlite');

        /**
         * Path to the database file.
         * @type {string}
         */
        this.filepath = path.resolve(filepath);

        /**
         * Name of the table.
         * @type {string}
         */
        this.tableName = options.tableName || 'configs';

        /**
         * Default configuration.
         * @type {Object}
         */
        this.defaultConfig = options.defaultConfig || {};

        /**
         * Keys to parse and stringify as JSON.
         * @type {string[]}
         */
        this.json = options.json || [];

        /**
         * The database.
         * @type {Database}
         */
        this.db = null;

        /**
         * Configurations stored in memory, mapped by ID to configuration.
         * @type {Collection<string, Object>}
         */
        this.memory = new Collection();

        /**
         * Returns an array of IDs.
         * @method
         * @param {AkairoClient} client - Client to use.
         * @returns {string[]}
         */
        this.init = typeof options.init === 'function' ? options.init : () => options.init;

        /**
         * The Akairo client.
         * @readonly
         * @name SQLiteHandler#client
         * @type {AkairoClient}
         */
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
     * Values from here should be desanitized.
     * @type {Object[]}
     */
    get configs() {
        return this.memory.array();
    }

    /**
     * Sanitizes a string by replacing single quotes with two single quotes.
     * Can return a non-string if `json` is set to false.
     * @param {string} input - Input text.
     * @param {boolean} json - Whether to stringify or not.
     * @returns {any}
     */
    sanitize(input, json = false) {
        if (json && typeof input !== 'string') return JSON.stringify(input).replace(/'/g, '\'\'');
        if (typeof input !== 'string') return input;
        return input.replace(/'/g, '\'\'');
    }

    /**
     * Desanitizes a string for use by replacing two single quotes with a single quote.
     * Can return a non-string if `json` is set to true.
     * @param {string} input - Input text.
     * @param {boolean} [json] - Whether to parse or not.
     * @returns {any}
     */
    desanitize(input, json = false) {
        if (json && typeof input === 'string') return JSON.parse(input.replace(/''/g, '\''));
        if (typeof input !== 'string') return input;
        return input.replace(/''/g, '\'');
    }

    /**
     * Opens the database so that it can be used.
     * @returns {Promise<Database>}
     */
    open() {
        return sql.open(this.filepath).then(db => {
            this.db = db;
            return this.db;
        });
    }

    /**
     * Loads handler and database with IDs.
     * Use manually if you want to load database before client is ready.
     * @param {string[]} ids - Array of IDs.
     * @returns {Promise<SQLiteHandler>}
     */
    load(ids) {
        return this.open().then(db => {
            return db.all(`SELECT * FROM "${this.tableName}"`).then(rows => {
                for (const row of rows) {
                    this.memory.set(row.id, row);
                }

                const promises = [];

                for (let id of ids) {
                    id = this.sanitize(id);
                    if (!this.has(id)) promises.push(this.add(id));
                }

                return Promise.all(promises).then(() => {
                    this.emit(SQLiteHandlerEvents.INIT);
                    return this;
                });
            });
        });
    }

    /**
     * Adds into the database.
     * @param {string} id - ID of entry.
     * @returns {Promise<SQLiteHandler>}
     */
    add(id) {
        if (!this.db) return Promise.reject(new Error(`Database with table ${this.tableName} not opened.`));

        id = this.sanitize(id);
        if (this.has(id)) return Promise.reject(new Error(`${id} already exists in ${this.tableName}.`));

        return this.db.run(`INSERT INTO "${this.tableName}" (id) VALUES ('${id}')`).then(() => {
            const config = Object.assign({}, this.defaultConfig);

            config.id = id;
            this.memory.set(id, config);

            this.emit(SQLiteHandlerEvents.ADD, config, false);
            return this;
        });
    }

    /**
     * Adds into the in-memory config.
     * @param {string} id - ID of entry.
     * @returns {SQLiteHandler}
     */
    addMemory(id) {
        id = this.sanitize(id);
        if (this.has(id)) throw new Error(`${id} already exists in ${this.tableName}.`);

        const config = Object.assign({}, this.defaultConfig);

        config.id = id;
        this.memory.set(id, config);

        this.emit(SQLiteHandlerEvents.ADD, config, true);
        return this;
    }

    /**
     * Removes from the database.
     * @param {string} id - ID of entry.
     * @returns {Promise<SQLiteHandler>}
     */
    remove(id) {
        if (!this.db) return Promise.reject(new Error(`Database with table ${this.tableName} not opened.`));

        id = this.sanitize(id);
        if (!this.has(id)) return Promise.reject(new Error(`${id} does not exist in ${this.tableName}.`));

        return this.db.run(`DELETE FROM "${this.tableName}" WHERE id = '${id}'`).then(() => {
            this.memory.delete(id);
            this.emit(SQLiteHandlerEvents.REMOVE, id, false);
            return this;
        });
    }

    /**
     * Removes from the in-memory config.
     * @param {string} id - ID of entry.
     * @returns {SQLiteHandler}
     */
    removeMemory(id) {
        id = this.sanitize(id);
        if (!this.has(id)) throw new Error(`${id} does not exist in ${this.tableName}.`);

        this.memory.delete(id);
        this.emit(SQLiteHandlerEvents.REMOVE, id, true);
        return this;
    }

    /**
     * Checks if ID exists in config.
     * @param {string} id ID of entry.
     * @returns {boolean}
     */
    has(id) {
        id = this.sanitize(id);
        return this.memory.has(id);
    }

    /**
     * Gets configuration for an ID.
     * @param {string} id - ID of entry.
     * @param {string[]} [keys] - Specific keys to get.
     * Leave blank to get the entire configuration.
     * @returns {Object}
     */
    get(id, keys) {
        id = this.sanitize(id);

        const config = this.memory.get(id) || this.defaultConfig;
        const copy = {};

        for (const key of keys || Object.keys(config)) {
            if (config[key] == null) {
                if (this.json.includes(key) && typeof this.defaultConfig[key] === 'string') {
                    copy[key] = JSON.parse(this.defaultConfig[key]);
                    continue;
                }

                copy[key] = this.defaultConfig[key];
                continue;
            }

            copy[key] = this.desanitize(config[key], this.json.includes(key));
        }

        return copy;
    }

    /**
     * Updates the database.
     * @param {string} id - ID of entry.
     * @param {string} key - Key to set.
     * @param {string|number} value - Value to set.
     * @returns {Promise<SQLiteHandler>}
     */
    set(id, key, value) {
        if (!this.db) return Promise.reject(new Error(`Database with table ${this.tableName} not opened.`));

        id = this.sanitize(id);
        key = this.sanitize(key);
        value = this.sanitize(value, this.json.includes(key));

        if (!this.has(id)) return Promise.reject(new Error(`${id} not found in ${this.tableName}.`));

        const config = this.memory.get(id);

        if (!config.hasOwnProperty(key)) return Promise.reject(new Error(`Key ${key} was not found for ${id} in ${this.tableName}.`));
        if (key === 'id') return Promise.reject(new Error('The id key is read-only.'));

        config[key] = value;
        this.memory.set(id, config);

        if (isNaN(value)) {
            value = `'${value}'`;
        }

        return this.db.run(`UPDATE "${this.tableName}" SET ${key} = ${value} WHERE id = '${id}'`).then(() => {
            this.emit(SQLiteHandlerEvents.SET, config, true);
            return this;
        });
    }

    /**
     * Updates the in-memory configuration.
     * @param {string} id - ID of entry.
     * @param {string} key - Key to set.
     * @param {string|number} value - Value to set.
     * @returns {SQLiteHandler}
     */
    setMemory(id, key, value) {
        id = this.sanitize(id);
        key = this.sanitize(key);
        value = this.sanitize(value, this.json.includes(key));

        if (!this.has(id)) throw new Error(`${id} not found in ${this.tableName}.`);

        const config = this.memory.get(id);

        if (!config.hasOwnProperty(key)) throw new Error(`Key ${key} was not found for ${id} in ${this.tableName}.`);
        if (key === 'id') throw new Error('The id key is read-only.');

        config[key] = value;
        this.memory.set(id, config);
        this.emit(SQLiteHandlerEvents.SET, config, false);
        return this;
    }

    /**
     * Saves an in-memory config to the database.
     * @param {string} id - ID to save.
     * @returns {Promise<SQLiteHandler>}
     */
    save(id) {
        if (!this.db) return Promise.reject(new Error(`Database with table ${this.tableName} not opened.`));

        id = this.sanitize(id);
        if (!this.has(id)) return Promise.reject(new Error(`${id} not found in ${this.tableName}.`));

        const config = this.memory.get(id);
        const sets = [];

        for (const key of Object.keys(config)) {
            let value = config[key];

            if (isNaN(value)) {
                value = `'${value}'`;
            }

            sets.push(`${key} = ${value}`);
        }

        return this.db.get(`SELECT count(1) FROM "${this.tableName}" WHERE id = '${id}'`).then(count => {
            let promise;
            let insert = false;

            if (!count['count(1)']) {
                promise = this.db.run(`INSERT INTO "${this.tableName}" (id) VALUES ('${id}')`);
                insert = true;
            } else {
                promise = Promise.resolve();
            }

            return promise.then(() => {
                this.db.run(`UPDATE "${this.tableName}" SET ${sets.join(', ')} WHERE id = '${id}'`);
                return insert;
            });
        }).then(insert => {
            this.emit(SQLiteHandlerEvents.SAVE, config, insert);
            return this;
        });
    }

    /**
     * Saves all in-memory configs to the database.
     * @returns {Promise<SQLiteHandler>}
     */
    saveAll() {
        const promises = [];
        for (const config of this.memory.values()) promises.push(this.save(config.id));

        return Promise.all(promises).then(() => {
            this.emit(SQLiteHandlerEvents.SAVE_ALL);
            return this;
        });
    }
}

module.exports = SQLiteHandler;

/**
 * Emitted when the handler is initalized.
 * @event SQLiteHandler#init
 */

/**
 * Emitted when a config is added.
 * @event SQLiteHandler#add
 * @param {Object} config - Config added.
 * @param {boolean} memory - Whether or not this was done in memory only.
 */

/**
 * Emitted when an ID is removed.
 * @event SQLiteHandler#remove
 * @param {string} id - ID removed.
 * @param {boolean} memory - Whether or not this was done in memory only.
 */

/**
 * Emitted when something was set.
 * @event SQLiteHandler#set
 * @param {Object} config - Config that changed.
 * @param {boolean} memory - Whether or not this was done in memory only.
 */

/**
 * Emitted when a config was saved from memory.
 * @event SQLiteHandler#save
 * @param {Object} config - Config that was saved.
 * @param {boolean} newInsert - Whether or not the config has been in the database before.
 */

/**
 * Emitted when many configs were saved from memory.
 * @event SQLiteHandler#saveAll
 */

/**
 * Options to use for the SQLiteHandler.
 * @typedef {Object} SQLiteOptions
 * @prop {string} [tablename='configs'] - Name of the table.
 * @prop {Object} [defaultConfig={}] - Default configuration.
 * @prop {string[]} [json=[]] - Array of keys to parse and stringify as JSON.
 * @prop {string[]|SQLiteInitFunction} [init=[]] - IDs to use to initialize database.
 * If you want to load the database before login, use `SQLiteHandler#load`.
 */

/**
 * Function used to get IDs for database.
 * @typedef {Function} SQLiteInitFunction
 * @param {AkairoClient} client - The client.
 * @returns {string[]}
 */
