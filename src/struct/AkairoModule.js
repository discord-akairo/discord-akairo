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
     * Returns the ID.
     * @returns {string}
     */
    toString() {
        return this.id;
    }
}

module.exports = AkairoModule;
