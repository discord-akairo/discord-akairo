const { AkairoHandlerEvents } = require('../util/Constants');

/**
 * Base class for a module.
 * @param {string} id - ID of module.
 * @param {ModuleExecFunction} exec - Function called when module is used.
 * @param {ModuleOptions} [options={}] - Options.
 */
class AkairoModule {
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

        /**
         * ID of the module.
         * @type {string}
         */
        this.id = id;

        /**
         * Category this belongs to.
         * @type {Category}
         */
        this.category = options.category || 'default';

        /**
         * Whether or not this is enabled.
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * The filepath.
         * @readonly
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Akairo client.
         * @readonly
         * @type {AkairoClient}
         */
        this.client = null;

        /**
         * The handler.
         * @readonly
         * @type {AkairoHandler}
         */
        this.handler = null;

        /**
         * Executes the module.
         * @method
         * @param {...any} args - Arguments.
         * @returns {any}
         */
        this.exec = exec || this.exec;
    }

    /**
     * Reloads the module.
     * @returns {AkairoModule}
     */
    reload() {
        return this.handler.reload(this.id);
    }

    /**
     * Removes the module.
     * @returns {AkairoModule}
     */
    remove() {
        return this.handler.remove(this.id);
    }

    /**
     * Enables the module.
     * @returns {boolean}
     */
    enable() {
        if (this.enabled) return false;
        this.enabled = true;
        this.handler.emit(AkairoHandlerEvents.ENABLE, this);
        return true;
    }

    /**
     * Disables the module.
     * @returns {boolean}
     */
    disable() {
        if (!this.enabled) return false;
        this.enabled = false;
        this.handler.emit(AkairoHandlerEvents.DISABLE, this);
        return true;
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString() {
        return this.id;
    }
}

module.exports = AkairoModule;

/**
 * Options for module.
 * @typedef {Object} ModuleOptions
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

/**
 * The module's execution function.
 * @typedef {Function} ModuleExecFunction
 * @param {...any} args - Arguments.
 * @returns {any}
 */
