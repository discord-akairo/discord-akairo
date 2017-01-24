const Collection = require('discord.js').Collection;

class DatabaseHandler {
    /**
     * An in-memory database.
     * @param {Object} [defaultConfig={}] - Default configuration.
     */
    constructor(defaultConfig = {}){
        /**
         * Default configuration.
         * @type {Object}
         */
        this.defaultConfig = defaultConfig;

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
     * Initializes with IDs.
     * @param {string[]} ids - Array of IDs.
     * @returns {DatabaseHandler}
     */
    init(ids){ 
        ids.forEach(id => {
            if (!this.has(id)) this.add(id);
        });

        return this;
    }

    /** 
     * Adds an entry.
     * @param {string} id - ID of entry.
     * @returns {DatabaseHandler}
     */
    add(id){ 
        if (this.has(id)) throw new Error(`${id} already exists.`);

        let config = this.defaultConfig;

        config.id = id;
        this.memory.set(id, config);
        return this;
    }

    /** 
     * Removes an entry.
     * @param {string} id - ID of entry.
     * @returns {DatabaseHandler}
     */
    remove(id){ 
        if (!this.has(id)) throw new Error(`${id} does not exist.`);
        this.memory.delete(id);
        return this;
    }

    /** 
     * Checks if ID exists.
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
        if (!this.has(id)) return this.defaultConfig;
        
        let config = this.memory.get(id);
        let copy = {};

        Object.keys(config).forEach(key => {
            if (config[key] == undefined) return copy[key] = this.defaultConfig[key];
            copy[key] = this.desanitize(config[key]);
        });

        return copy;
    }

    /**
     * Updates a value.
     * @param {string} id - ID of entry.
     * @param {string} key - Key to set.
     * @param {string|number} value - Value to set.
     * @returns {DatabaseHandler}
     */
    set(id, key, value){
        if (!this.has(id)) throw new Error(`${id} not found.`);

        let config = this.memory.get(id);

        if (!config.hasOwnProperty(key)) throw new Error(`Key ${key} was not found for ${id}.`);
        if (key === 'id') throw new Error('The id key is read-only.');

        config[key] = value;
        this.memory.set(id, config);
        return this;
    }
}

module.exports = DatabaseHandler;