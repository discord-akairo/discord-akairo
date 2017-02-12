const path = require('path');
const EventEmitter = require('events');
const rread = require('readdir-recursive');
const AkairoModule = require('./AkairoModule');
const Category = require('../utils/Category');
const { AkairoHandlerEvents } = require('../utils/Constants');
const { Collection } = require('discord.js');

/** @extends EventEmitter */
class AkairoHandler extends EventEmitter {
    /**
     * Handles modules.
     * @param {AkairoClient} client - The Akairo client.
     * @param {string} directory - Directory to modules.
     * @param {class} classToHandle - Only instances of this can be handled.<br/>Other classes are ignored.
     */
    constructor(client, directory, classToHandle){
        super();

        /**
         * The Akairo client.
         * @readonly
         * @name AkairoHandler#client
         * @type {AkairoClient}
         */

        /**
         * Directory to modules.
         * @readonly
         * @name AkairoHandler#directory
         * @type {string}
         */

        /**
         * Class to handle.
         * @readonly
         * @name AkairoHandler#classToHandle
         * @type {class}
         */

        Object.defineProperties(this, {
            client: { value: client },
            directory: { value: path.resolve(directory) },
            classToHandle: { value: classToHandle || AkairoModule }
        });

        /**
         * Modules loaded, mapped by ID to AkairoModule.
         * @type {Collection.<string, AkairoModule>}
         */
        this.modules = new Collection();

        /**
         * Categories, mapped by ID to Category.
         * @type {Collection.<string, Category>}
         */
        this.categories = new Collection();

        const filepaths = rread.fileSync(this.directory);
        filepaths.forEach(filepath => {
            this.load(filepath);
        });
    }

    /**
     * Loads a module.
     * @param {string} filepath - Path to file.
     * @returns {AkairoModule}
     */
    load(filepath){
        const mod = require(filepath);

        if (!(mod instanceof this.classToHandle)) return;
        if (this.modules.has(mod.id)) throw new Error(`${mod.id} already loaded.`);

        mod.filepath = filepath;
        mod.client = this.client;
        mod.handler = this;

        this.modules.set(mod.id, mod);

        if (!this.categories.has(mod.category)) this.categories.set(mod.category, new Category(mod.category));
        const category = this.categories.get(mod.category);
        mod.category = category;
        category.set(mod.id, mod);

        return mod;
    }

    /**
     * Adds a module.
     * @param {string} filename - Filename to lookup in the directory.<br/>A .js extension is assumed.
     * @returns {AkairoModule}
     */
    add(filename){
        const files = rread.fileSync(this.directory);
        const filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        const mod = this.load(filepath);
        this.emit(AkairoHandlerEvents.ADD, mod);
        return mod;
    }

    /**
     * Removes a module.
     * @param {string} id - ID of the module.
     * @returns {AkairoModule}
     */
    remove(id){
        const mod = this.modules.get(id);
        if (!mod) throw new Error(`${id} does not exist.`);

        delete require.cache[require.resolve(mod.filepath)];
        this.modules.delete(mod.id);
        
        mod.category.delete(mod.id);

        this.emit(AkairoHandlerEvents.REMOVE, mod);
        return mod;
    }

    /**
     * Reloads a module.
     * @param {string} id - ID of the module.
     * @returns {AkairoModule}
     */
    reload(id){
        const mod = this.modules.get(id);
        if (!mod) throw new Error(`${id} does not exist.`);

        const filepath = mod.filepath;

        delete require.cache[require.resolve(mod.filepath)];
        this.modules.delete(mod.id);

        mod.category.delete(mod.id);
        
        const newMod = this.load(filepath);
        this.emit(AkairoHandlerEvents.RELOAD, newMod);
        return newMod;
    }

    /**
     * Reloads all modules.
     */
    reloadAll(){
        this.modules.forEach(c => c.reload());
    }

    /**
     * Finds a category by name.
     * @param {string} name - Name to find with.
     * @returns {Category}
     */
    findCategory(name){
        return this.categories.find(category => {
            return category.id.toLowerCase() === name.toLowerCase();
        });
    }
}

module.exports = AkairoHandler;

/**
 * Emitted when a module is added.
 * @event AkairoHandler#add
 * @param {AkairoModule} mod - Module added.
 */

/**
 * Emitted when a module is removed.
 * @event AkairoHandler#remove
 * @param {AkairoModule} mod - Module removed.
 */

/**
 * Emitted when a module is reloaded.
 * @event AkairoHandler#reload
 * @param {AkairoModule} mod - Module reloaded.
 */

/**
 * Emitted when a module is enabled.
 * @event AkairoHandler#enable
 * @param {AkairoModule} mod - Module enabled.
 */

/**
 * Emitted when a module is disabled.
 * @event AkairoHandler#disable
 * @param {AkairoModule} mod - Module disabled.
 */
