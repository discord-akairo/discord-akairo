const { AkairoHandlerEvents } = require('../util/Constants');

/**
 * Options for module.
 * @typedef {Object} ModuleOptions
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

class AkairoModule {
    /**
     * Creates a new module.
     * @param {string} id - ID of module.
     * @param {ModuleOptions} [options={}] - Options.
     */
    constructor(id, { category = 'default' } = {}) {
        /**
         * ID of the module.
         * @type {string}
         */
        this.id = id;

        /**
         * ID of the category this belongs to.
         * @type {string}
         */
        this.categoryID = category;

        /**
         * Category this belongs to.
         * @type {Category}
         */
        this.category = null;

        /**
         * Whether or not this is enabled.
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * The filepath.
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Akairo client.
         * @type {AkairoClient}
         */
        this.client = null;

        /**
         * The handler.
         * @type {AkairoHandler}
         */
        this.handler = null;
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
