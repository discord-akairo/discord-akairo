const path = require('path');

class DatabaseHandler {
    /**
     * This class should be extended, not used.
     */
    constructor(filepath, defaultConfig){
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
         * Configurations stored in memory, mapped by ID to configuration.
         * @type {Map<string, Object>}
         */
        this.memory = new Map();

        /**
         * The database.
         * @type {Object}
         */
        this.db = null;
    }

    /**
     * Gets all the IDs.
     * @return {Array.<string>}
     */
    get ids(){
        return Array.from(this.memory.keys());
    }

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
}

module.exports = DatabaseHandler;