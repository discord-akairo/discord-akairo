const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const AkairoModule = require('./AkairoModule');
const Category = require('../util/Category');
const { AkairoHandlerEvents } = require('../util/Constants');
const { Collection } = require('discord.js');

/** @extends EventEmitter */
class AkairoHandler extends EventEmitter {
    /**
     * Handles modules.
     * @param {AkairoClient} client - The Akairo client.
     * @param {string} directory - Directory to modules.
     * @param {class} classToHandle - Only instances of this can be handled.
     * <br>Other classes are ignored.
     */
    constructor(client, directory, classToHandle) {
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
         * @type {Function}
         */

        Object.defineProperties(this, {
            client: {
                value: client
            },
            directory: {
                value: path.resolve(directory)
            },
            classToHandle: {
                value: classToHandle || AkairoModule
            }
        });

        /**
         * Modules loaded, mapped by ID to AkairoModule.
         * @type {Collection<string, AkairoModule>}
         */
        this.modules = new Collection();

        /**
         * Categories, mapped by ID to Category.
         * @type {Collection<string, Category>}
         */
        this.categories = new Collection();

        const filepaths = this.constructor.readdirRecursive(this.directory);
        for (const filepath of filepaths) this.load(filepath);
    }

    /**
     * Loads a module, can be a filepath or an object.
     * @param {string|AkairoModule} thing - Module or path to module.
     * @returns {AkairoModule}
     */
    load(thing) {
        const isObj = typeof thing === 'object';
        const mod = isObj ? thing : require(thing);

        if (!(mod instanceof this.classToHandle)) return undefined;
        if (this.modules.has(mod.id)) throw new Error(`${this.classToHandle.name} ${mod.id} already loaded.`);

        Object.defineProperties(mod, {
            filepath: {
                value: isObj ? null : thing
            },
            client: {
                value: this.client
            },
            handler: {
                value: this
            }
        });

        this.modules.set(mod.id, mod);

        if (!this.categories.has(mod.category)) this.categories.set(mod.category, new Category(mod.category));
        const category = this.categories.get(mod.category);
        mod.category = category;
        category.set(mod.id, mod);

        return mod;
    }

    /**
     * Adds a module.
     * @param {string} filename - Filename to lookup in the directory.
     * <br>A .js extension is assumed.
     * @returns {AkairoModule}
     */
    add(filename) {
        const files = this.constructor.readdirRecursive(this.directory);
        const filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath) throw new Error(`File ${filename} not found.`);

        const mod = this.load(filepath);
        this.emit(AkairoHandlerEvents.ADD, mod);
        return mod;
    }

    /**
     * Removes a module.
     * @param {string} id - ID of the module.
     * @returns {AkairoModule}
     */
    remove(id) {
        const mod = this.modules.get(id.toString());
        if (!mod) throw new Error(`${this.classToHandle.name} ${id} does not exist.`);

        if (mod.filepath) delete require.cache[require.resolve(mod.filepath)];
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
    reload(id) {
        const mod = this.modules.get(id.toString());
        if (!mod) throw new Error(`${this.classToHandle.name} ${id} does not exist.`);
        if (!mod.filepath) throw new Error(`${this.classToHandle.name} ${id} is not reloadable.`);

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
     * @returns {AkairoHandler}
     */
    reloadAll() {
        for (const m of Array.from(this.modules.values())) m.reload();
        return this;
    }

    /**
     * Finds a category by name.
     * @param {string} name - Name to find with.
     * @returns {Category}
     */
    findCategory(name) {
        return this.categories.find(category => {
            return category.id.toLowerCase() === name.toLowerCase();
        });
    }

    /**
     * Reads files recursively from a directory.
     * @param {string} directory - Directory to read.
     * @returns {string[]}
     */
    static readdirRecursive(directory) {
        const result = [];

        (function read(dir) {
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const filepath = path.join(dir, file);

                if (fs.statSync(filepath).isDirectory()) {
                    read(filepath);
                } else {
                    result.push(filepath);
                }
            }
        }(directory));

        return result;
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
