const path = require('path');
const EventEmitter = require('events');
const { Collection } = require('discord.js');
let sql;

/**
 * Options to use for the SQLiteHandler.
 * @typedef {Object} SQLiteOptions
 * @prop {string} [tablename='configs'] - Name of the table.
 * @prop {Object} [defaultConfig={}] - Default configuration.
 * @prop {boolean} [json=false] - Whether or not to stringify and parse input and output.
 */

/** @extends EventEmitter */
class SQLiteHandler extends EventEmitter {
    /**
     * Creates an SQLiteHandler. Tables must have an 'id' column.
     * @param {string} filepath - Path to .sqlite file.
     * @param {SQLiteOptions} options - Options for the handler.
     */
    constructor(filepath, options = {}){
        super();

        sql = require('sqlite');

        /**
         * Path to the database file.
         * @readonly
         * @type {string}
         */
        this.filepath = path.resolve(filepath);

        /**
         * Name of the table.
         * @readonly
         * @type {string}
         */
        this.tableName = options.tableName || 'configs';

        /**
         * Default configuration.
         * @readonly
         * @type {Object}
         */
        this.defaultConfig = options.defaultConfig || {};

        /**
         * Whether or not to stringify and parse input and output.
         * @readonly
         * @type {boolean}
         */
        this.json = !!options.json;

        /**
         * The database.
         * @readonly
         * @type {Object}
         */
        this.db = null;

        /**
         * Configurations stored in memory, mapped by ID to configuration.
         * @type {Collection.<string, Object>}
         */
        this.memory = new Collection();
    }

    /**
     * Array of IDs. Note that this calls the Collection's keyArray().
     * @type {string[]}
     */
    get ids(){
        return this.memory.keyArray();
    }

    /**
     * Array of configs. Note that this calls the Collection's array().
     * @type {string[]}
     */
    get configs(){
        return this.memory.array();
    }

    /**
     * Sanitizes a string by replacing single quotes with two single quotes.
     * @param {string} input - Input text.
     * @return {string}
     */
    sanitize(input){
        if (this.json && typeof input !== 'string') return JSON.stringify(input).replace(/'/g, '\'\'');
        if (typeof input !== 'string') return input;
        return input.replace(/'/g, '\'\'');
    }

    /**
     * Desanitizes a string for use by replacing two single quotes with a single quote.
     * @param {string} input - Input text.
     * @return {string}
     */
    desanitize(input){
        if (this.json && typeof input === 'string') return JSON.parse(input.replace(/''/g, '\''));
        if (typeof input !== 'string') return input;
        return input.replace(/''/g, '\'');
    }

    /**
     * Opens the database so that it can be used.
     * @return {Promise.<Database>}
     */
    open(){
        return sql.open(this.filepath).then(db => {
            this.db = db;
            return this.db;
        });
    }

    /**
     * Initializes handler and database with IDs.
     * @param {string[]} ids - Array of IDs.
     * @returns {Promise.<SQLiteHandler>}
     */
    init(ids){
        return this.open().then(db => {
            return db.all(`SELECT * FROM "${this.tableName}"`).then(rows => {
                rows.forEach((row) => {
                    this.memory.set(row.id, row);
                });

                const promises = [];

                ids.forEach(id => {
                    if (!this.has(id)) promises.push(this.add(id));
                });
                
                return Promise.all(promises).then(() => {
                    this.emit('init');
                    return this;
                });
            });
        });
    }

    /**
     * Adds into the database.
     * @param {string} id - ID of entry.
     * @returns {Promise.<SQLiteHandler>}
     */
    add(id){
        if (!this.db) return Promise.reject(new Error('Database not opened.'));
        if (this.has(id)) return Promise.reject(`${id} already exists.`);

        return this.db.run(`INSERT INTO "${this.tableName}" (id) VALUES ('${id}')`).then(() => {
            const config = Object.assign({}, this.defaultConfig);

            config.id = id;
            this.memory.set(id, config);

            this.emit('add', config, false);
            return this;
        });
    }

    /**
     * Adds into the in-memory config.
     * @param {string} id - ID of entry.
     * @returns {SQLiteHandler}
     */
    addMemory(id){
        if (this.has(id)) throw new Error(`${id} already exists.`);

        const config = Object.assign({}, this.defaultConfig);

        config.id = id;
        this.memory.set(id, config);

        this.emit('add', config, true);
        return this;
    }

    /**
     * Removes from the database.
     * @param {string} id - ID of entry.
     * @returns {Promise.<SQLiteHandler>}
     */
    remove(id){
        if (!this.db) return Promise.reject(new Error('Database not opened.'));
        if (!this.has(id)) return Promise.reject(`${id} does not exist.`);
        
        return this.db.run(`DELETE FROM "${this.tableName}" WHERE id = '${id}'`).then(() => {
            this.memory.delete(id);
            this.emit('remove', id, false);
            return this;
        });
    }

    /**
     * Removes from the in-memory config.
     * @param {string} id - ID of entry.
     * @returns {SQLiteHandler}
     */
    removeMemory(id){
        if (!this.has(id)) throw new Error(`${id} does not exist.`);
        this.memory.delete(id);
        this.emit('remove', id, true);
        return this;
    }

    /**
     * Checks if ID exists in config.
     * @param {string} id ID of entry.
     * @returns {boolean}
     */
    has(id){
        return this.memory.has(id);
    }

    /**
     * Gets configuration for an ID.
     * @param {string} id - ID of entry.
     * @returns {Object}
     */
    get(id){
        if (!this.has(id)) return Object.assign({}, this.defaultConfig);
        
        const config = this.memory.get(id);
        const copy = {};

        Object.keys(config).forEach(key => {
            if (config[key] == undefined) return copy[key] = this.defaultConfig[key];
            copy[key] = this.desanitize(config[key]);
        });

        return copy;
    }

    /**
     * Updates the database.
     * @param {string} id - ID of entry.
     * @param {string} key - Key to set.
     * @param {string|number} value - Value to set.
     * @returns {Promise.<SQLiteHandler>}
     */
    set(id, key, value){
        if (!this.db) return Promise.reject(new Error('Database not opened.'));

        key = this.sanitize(key);
        value = this.sanitize(value);

        if (!this.has(id)) return Promise.reject(new Error(`${id} not found.`));
        
        const config = this.memory.get(id);

        if (!config.hasOwnProperty(key)) return Promise.reject(new Error(`Key ${key} was not found for ${id}.`));
        if (key === 'id') return Promise.reject(new Error('The id key is read-only.'));
        
        config[key] = value;
        this.memory.set(id, config);

        if (isNaN(value)){
            value = `'${value}'`;
        }
        
        return this.db.run(`UPDATE "${this.tableName}" SET ${key} = ${value} WHERE id = '${id}'`).then(() => {
            this.emit('set', config, true);
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
    setMemory(id, key, value){
        key = this.sanitize(key);
        value = this.sanitize(value);

        if (!this.has(id)) throw new Error(`${id} not found.`);
        
        const config = this.memory.get(id);

        if (!config.hasOwnProperty(key)) throw new Error(`Key ${key} was not found for ${id}.`);
        if (key === 'id') throw new Error('The id key is read-only.');
        
        config[key] = value;
        this.memory.set(id, config);
        this.emit('set', config, false);
        return this;
    }

    /**
     * Saves an in-memory config to the database.
     * @param {string} id - ID to save.
     * @returns {Promise.<SQLiteHandler>}
     */
    save(id){
        if (!this.db) return Promise.reject(new Error('Database not opened.'));
        if (!this.has(id)) return Promise.reject(new Error(`${id} not found.`));

        const config = this.memory.get(id);
        const sets = [];

        Object.keys(config).forEach(key => {
            let value = config[key];

            if (isNaN(value)){
                value = `'${value}'`;
            }

            sets.push(`${key} = ${value}`);
        });

        return this.db.get(`SELECT count(1) FROM "${this.tableName}" WHERE id = '${id}'`).then(count => {
            let promise;
            let insert = false;

            if (!count['count(1)']){
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
            this.emit('save', config, insert);
            return this;
        });
    }

    /**
     * Saves all in-memory configs to the database.
     * @returns {Promise.<SQLiteHandler>}
     */
    saveAll(){
        const promises = this.memory.map(config => this.save(config.id));
        return Promise.all(promises).then(() => this);
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
