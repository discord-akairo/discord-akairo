const path = require('path');
const Collection = require('discord.js').Collection;

class DatabaseHandler {
    /**
     * This class should be extended, not used.
     * @param {string} filepath - Path to database file.
     * @param {Object} [defaultConfig={}] - Default configuration.
     */
    constructor(filepath, defaultConfig = {}){
        /**
         * Path to the database file.
         * @readonly
         * @type {string}
         */
        this.filepath = path.resolve(filepath);
        
        /**
         * Default configuration.
         * @type {Object}
         */
        this.defaultConfig = defaultConfig;

        /** 
         * Configurations stored in memory, mapped by ID to configuration. Note that if you modify/get values directly from here, you should use the handler's sanitize() and desanitize() methods.
         * @type {Collection.<string, Object>}
         */
        this.memory = new Collection();

        /**
         * The database.
         * @readonly
         * @type {Object}
         */
        this.db = null;
    }

    /**
     * Array of IDs. Note that this calls the Collection's keyArray().
     * @return {string[]}
     */
    get ids(){
        return this.memory.keyArray();
    }

    /**
     * Array of configs. Note that this calls the Collection's array().
     * @return {string[]}
     */
    get configs(){
        return this.memory.array();
    }

    /** 
     * Should sanitize input.
     * @abstract
     */
    sanitize(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should desanitize text for use. 
     * @abstract
     */
    desanitize(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should open database. 
     * @abstract
     */
    open(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    
    /** 
     * Should initialize database. 
     * @abstract
     */
    init(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should add entry to database. 
     * @abstract
     */
    add(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should add entry to memory. 
     * @abstract
     */
    addMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should remove entry from database. 
     * @abstract
     */
    remove(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should remove entry from database. 
     * @abstract
     */
    removeMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should check if entry is in memory. 
     * @abstract
     */
    has(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should get entry from memory.
     * @abstract
     */
    get(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should update a value in database. 
     * @abstract
     */
    set(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should update a value in memory. 
     * @abstract
     */
    setMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should update a config from memory to database. 
     * @abstract
     */
    save(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** 
     * Should update all configs from memory to database.
     * @abstract
     */
    saveAll(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
}

module.exports = DatabaseHandler;