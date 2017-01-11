const path = require('path');

class DatabaseHandler {
    constructor(filepath, defaultConfig){
        /**
         * Path to .sqlite file.
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

    open(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    init(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    add(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    addMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    remove(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    removeMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    has(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    get(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    set(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    setMemory(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
    save(){ throw new Error('Cannot use base DatabaseHandler. Please extend it!'); }
}

module.exports = DatabaseHandler;