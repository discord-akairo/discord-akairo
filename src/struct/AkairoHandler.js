const AkairoError = require('../util/AkairoError');
const { AkairoHandlerEvents } = require('../util/Constants');
const AkairoModule = require('./AkairoModule');
const Category = require('../util/Category');
const { Collection } = require('discord.js');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/**
 * Options for module loading and handling.
 * @typedef {Object} AkairoHandlerOptions
 * @prop {string} [directory] - Directory to modules.
 * @prop {Function} [classToHandle=AkairoModule] - Only classes that extends this class can be handled.
 * @prop {string[]|Set<string>} [extensions] - File extensions to load.
 * By default this is .js, .json, and .ts files.
 */

/** @extends EventEmitter */
class AkairoHandler extends EventEmitter {
    /**
     * Handles module loading.
     * @param {AkairoClient} client - The Akairo client.
     * @param {AkairoHandlerOptions} options - Options for module loading and handling.
     */
    constructor(client, { directory, classToHandle = AkairoModule, extensions = ['.js', '.json', '.ts'] }) {
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
                value: classToHandle
            }
        });

        /**
         * File extensions to load.
         * @type {Set<string>}
         */
        this.extensions = new Set(extensions);

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
     * Registers a module.
     * @protected
     * @param {AkairoModule} mod - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    _register(mod, filepath) {
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
     * @protected
     * @param {AkairoModule} mod - Module to use.
     * @returns {void}
     */
    _deregister(mod) {
        if (mod.filepath) delete require.cache[require.resolve(mod.filepath)];
        this.modules.delete(mod.id);
        mod.category.delete(mod.id);
    }

    /**
     * Loads a module, can be a module class or a filepath.
     * @param {string|Function} thing - Module class or path to module.
     * @param {boolean} [isReload=false] - Whether this is a reload or not.
     * @returns {AkairoModule}
     */
    load(thing, isReload = false) {
        const isObj = typeof thing === 'object';
        if (!isObj && !this.extensions.has(path.extname(thing))) return undefined;

        const findExport = m => {
            if (!m) return null;
            if (m.prototype instanceof this.classToHandle) return m;
            return m.default ? findExport(m.default) : null;
        };

        let mod = isObj ? thing : findExport(require(thing));
        if (mod && mod.prototype instanceof this.classToHandle) {
            mod = new mod(this); // eslint-disable-line new-cap
        } else {
            if (!isObj) delete require.cache[require.resolve(thing)];
            return undefined;
        }

        if (this.modules.has(mod.id)) throw new AkairoError('ALREADY_LOADED', this.classToHandle.name, mod.id);

        this._register(mod, isObj ? null : thing);
        this.emit(AkairoHandlerEvents.LOAD, mod, isReload);
        return mod;
    }

    /**
     * Reads all modules from a directory and loads them.
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in to the constructor.
     * @returns {AkairoHandler}
     */
    loadAll(directory = this.directory) {
        const filepaths = this.constructor.readdirRecursive(directory);
        for (const filepath of filepaths) this.load(filepath);
        return this;
    }

    /**
     * Adds a module.
     * @param {string} filename - Filename to lookup in the directory.
     * A .js extension is assumed if one is not given.
     * @returns {AkairoModule}
     */
    add(filename) {
        if (!path.extname(filename)) filename = `${filename}.js`;

        const files = this.constructor.readdirRecursive(this.directory);
        const filepath = files.find(file => path.basename(file) === filename);

        if (!filepath) throw new AkairoError('FILE_NOT_FOUND', filename);
        return this.load(filepath);
    }

    /**
     * Removes a module.
     * @param {string} id - ID of the module.
     * @returns {AkairoModule}
     */
    remove(id) {
        const mod = this.modules.get(id.toString());
        if (!mod) throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);

        this._deregister(mod);

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
        if (!mod) throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);
        if (!mod.filepath) throw new AkairoError('NOT_RELOADABLE', this.classToHandle.name, id);

        this._deregister(mod);

        const filepath = mod.filepath;
        const newMod = this.load(filepath, true);
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
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a module is removed.
 * @event AkairoHandler#remove
 * @param {AkairoModule} mod - Module removed.
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
