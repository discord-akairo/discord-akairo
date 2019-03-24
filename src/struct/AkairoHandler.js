const { AkairoHandlerEvents } = require('../util/Constants');
const AkairoModule = require('./AkairoModule');
const Category = require('../util/Category');
const { Collection } = require('discord.js');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

let instanceDeprecation = false;

/**
 * Base class for handling modules.
 * @param {AkairoClient} client - The Akairo client.
 * @param {string} directory - Directory to modules.
 * @param {class} classToHandle - Only instances of this can be handled.
 * Exports not instance of this class are ignored.
 * @extends {EventEmitter}
 */
class AkairoHandler extends EventEmitter {
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
    }

    /**
     * Reads all modules from the directory and loads them.
     * @returns {AkairoHandler}
     */
    loadAll() {
        const filepaths = this.constructor.readdirRecursive(this.directory);
        for (const filepath of filepaths) this.load(filepath);
        return this;
    }

    /**
     * Registers a module.
     * @private
     * @param {AkairoModule} mod - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    _apply(mod, filepath) {
        Object.defineProperties(mod, {
            filepath: {
                value: filepath
            },
            client: {
                value: this.client
            },
            handler: {
                value: this
            }
        });

        this.modules.set(mod.id, mod);

        if (mod.category === 'default' && this.client.akairoOptions.automateCategories) {
            const dirs = path.dirname(filepath).split(path.sep);
            mod.category = dirs[dirs.length - 1];
        }

        if (!this.categories.has(mod.category)) this.categories.set(mod.category, new Category(mod.category));
        const category = this.categories.get(mod.category);
        mod.category = category;
        category.set(mod.id, mod);
    }

    /**
     * Deregisters a module.
     * @private
     * @param {AkairoModule} mod - Module to use.
     * @returns {void}
     */
    _unapply(mod) {
        if (mod.filepath) delete require.cache[require.resolve(mod.filepath)];
        this.modules.delete(mod.id);
        mod.category.delete(mod.id);
    }

    /**
     * Loads a module, can be a filepath or an object.
     * @param {string|AkairoModule} thing - Module or path to module.
     * @param {boolean} [isReload=false] - Whether this is a reload or not.
     * @returns {AkairoModule}
     */
    load(thing, isReload = false) {
        const isObj = typeof thing === 'object';
        if (!isObj && !/\.(js|json|ts)$/.test(thing)) return undefined;

        const findExport = m => {
            if (!m) return null;
            if (m instanceof this.classToHandle.constructor) return m;
            if (m instanceof this.classToHandle) return m;
            return findExport(m.default);
        };

        let mod = isObj ? thing : findExport(require(thing));

        if (mod instanceof this.classToHandle.constructor) {
            mod = new mod(this.client, this); // eslint-disable-line new-cap
        } else if (!instanceDeprecation) {
            instanceDeprecation = true;
            console.error('Akairo: Exports of module instances are deprecated. Consider exporting module classes.'); // eslint-disable-line no-console
        }

        if (!(mod instanceof this.classToHandle)) {
            if (!isObj) delete require.cache[require.resolve(thing)];
            return undefined;
        }

        if (this.modules.has(mod.id)) throw new Error(`${this.classToHandle.name} ${mod.id} already loaded.`);

        this._apply(mod, isObj ? null : thing);
        if (!isReload) this.emit(AkairoHandlerEvents.LOAD, mod);
        return mod;
    }

    /**
     * Adds a module.
     * @deprecated Use AkairoHandler#load
     * @param {string} filename - Filename to lookup in the directory.
     * A .js extension is assumed.
     * @returns {AkairoModule}
     */
    add(filename) {
        const files = this.constructor.readdirRecursive(this.directory);
        const filepath = files.find(file => ['js', 'json', 'ts'].some(ext => file.endsWith(`${filename}.${ext}`)));

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

        this._unapply(mod);

        this.emit(AkairoHandlerEvents.REMOVE, mod);
        return mod;
    }

    /**
     * Removes all modules.
     * @returns {AkairoHandler}
     */
    removeAll() {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath) this.remove(m.id);
        }

        return this;
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

        this._unapply(mod);

        const filepath = mod.filepath;
        const newMod = this.load(filepath, true);

        this.emit(AkairoHandlerEvents.RELOAD, newMod);
        return newMod;
    }

    /**
     * Reloads all modules.
     * @returns {AkairoHandler}
     */
    reloadAll() {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath) this.reload(m.id);
        }

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
 * Emitted when a module is loaded.
 * @event AkairoHandler#load
 * @param {AkairoModule} mod - Module loaded.
 */

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
