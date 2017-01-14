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
         * @type {Object}
         */
        this.db = null;
    }

    /**
     * Array of IDs.
     * @return {string[]}
     */
    get ids(){
        return Array.from(this.memory.keys());
    }

    /** Should sanitize input. */
    sanitize(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should desanitize text for use. */
    desanitize(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should open database. */
    open(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    
    /** Should initialize database. */
    init(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should add entry to database. */
    add(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should add entry to memory. */
    addMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should remove entry from database. */
    remove(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should remove entry from database. */
    removeMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should check if entry is in memory. */
    has(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should get entry from memory. */
    get(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should update a value in database. */
    set(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should update a value in memory. */
    setMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should update a config from memory to database. */
    save(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }

    /** Should update all configs from memory to database. */
    saveAll(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
}

module.exports = DatabaseHandler;