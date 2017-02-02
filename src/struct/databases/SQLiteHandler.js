const path = require('path');
const DatabaseHandler = require('./DatabaseHandler');

/** @extends DatabaseHandler */
class SQLiteHandler extends DatabaseHandler {
    /**
     * Creates an SQLiteHandler. Table must have an 'id' column.
     * @param {string} filepath - Path to .sqlite file.
     * @param {string} tableName - Name of the table.
     * @param {Object} [defaultConfig={}] - Default configuration.
     */
    constructor(filepath, tableName, defaultConfig = {}){
        super(defaultConfig);

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
        this.tableName = tableName;

        /**
         * The database.
         * @readonly
         * @type {Object}
         */
        this.db = null;
    }

    /**
     * Sanitizes a string by replacing single quotes with two single quotes.
     * @param {string} input - Input text.
     * @return {string}
     */
    sanitize(input){
        if (typeof input !== 'string') return input;
        return input.replace(/'/g, '\'\'');
    }

    /**
     * Desanitizes a string for use by replacing two single quotes with a single quote.
     * @param {string} input - Input text.
     * @return {string}
     */
    desanitize(input){
        if (typeof input !== 'string') return input;
        return input.replace(/''/g, '\'');
    }

    /**
     * Opens the database so that it can be used.
     * @return {Promise.<Database>}
     */
    open(){
        return new Promise((resolve, reject) => {
            require('sqlite').open(this.filepath).then(db => {
                this.db = db;
                resolve(this.db);
            }).catch(reject);
        });
    }

    /**
     * Initializes handler and database with IDs.
     * @param {string[]} ids - Array of IDs.
     * @returns {Promise.<SQLiteHandler>}
     */
    init(ids){
        return new Promise((resolve, reject) => {
            this.open().then(db => {
                db.all(`SELECT * FROM "${this.tableName}"`).then(rows => {
                    rows.forEach((row) => {
                        this.memory.set(row.id, row);
                    });

                    ids.forEach(id => {
                        if (!this.has(id)) this.add(id).catch(reject);
                    });
                    
                    resolve(this);
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * Adds into the database.
     * @param {string} id - ID of entry.
     * @returns {Promise.<SQLiteHandler>}
     */
    add(id){
        if (!this.db) return Promise.reject(new Error('Database not opened.'));

        return new Promise((resolve, reject) => {
            if (this.has(id)) return reject(`${id} already exists.`);

            this.db.run(`INSERT INTO "${this.tableName}" (id) VALUES ('${id}')`).then(() => {
                const config = this.defaultConfig;

                config.id = id;
                this.memory.set(id, config);

                resolve(this);
            }).catch(reject);
        });
    }

    /**
     * Adds into the in-memory config.
     * @param {string} id - ID of entry.
     * @returns {SQLiteHandler}
     */
    addMemory(id){
        if (this.has(id)) throw new Error(`${id} already exists.`);

        const config = this.defaultConfig;

        config.id = id;
        this.memory.set(id, config);
        return this;
    }

    /**
     * Removes from the database.
     * @param {string} id - ID of entry.
     * @returns {Promise.<SQLiteHandler>}
     */
    remove(id){
        if (!this.db) return Promise.reject(new Error('Database not opened.'));

        return new Promise((resolve, reject) => {
            if (!this.has(id)) return reject(`${id} does not exist.`);
            
            this.db.run(`DELETE FROM "${this.tableName}" WHERE id = '${id}'`).then(() => {
                this.memory.delete(id);
                resolve(this);
            }).catch(reject);
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
        if (!this.has(id)) return this.defaultConfig;
        
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

        return new Promise((resolve, reject) => {
            key = this.sanitize(key);
            value = this.sanitize(value);

            if (!this.has(id)) return reject(new Error(`${id} not found.`));
            
            const config = this.memory.get(id);

            if (!config.hasOwnProperty(key)) return reject(new Error(`Key ${key} was not found for ${id}.`));
            if (key === 'id') return reject(new Error('The id key is read-only.'));
            
            config[key] = value;
            this.memory.set(id, config);

            if (isNaN(value)){
                value = `'${value}'`;
            }
            
            this.db.run(`UPDATE "${this.tableName}" SET ${key} = ${value} WHERE id = '${id}'`).then(() => {
                resolve(this);
            }).catch(reject);
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
        return this;
    }

    /**
     * Saves an in-memory config to the database.
     * @param {string} id - ID to save.
     * @returns {Promise.<SQLiteHandler>}
     */
    save(id){
        if (!this.db) return Promise.reject(new Error('Database not opened.'));

        return new Promise((resolve, reject) => {
            if (!this.has(id)){
                return reject(new Error(`${id} not found.`));
            }

            const config = this.memory.get(id);
            const sets = [];

            Object.keys(config).forEach(key => {
                let value = config[key];

                if (isNaN(value)){
                    value = `'${value}'`;
                }

                sets.push(`${key} = ${value}`);
            });

            this.db.run(`UPDATE "${this.tableName}" SET ${sets.join(', ')} WHERE id = '${id}'`).then(() => {
                resolve(this);
            }).catch(reject);
        });
    }

    /**
     * Saves all in-memory configs to the database.
     * @returns {Promise.<SQLiteHandler>}
     */
    saveAll(){
        return new Promise((resolve, reject) => {
            const p = this.memory.map(config => this.save(config.id));
            Promise.all(p).then(() => resolve(this)).catch(reject);
        });
    }
}

module.exports = SQLiteHandler;
