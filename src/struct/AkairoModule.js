const { AkairoHandlerEvents } = require('../utils/Constants');

/**
 * Options for module.
 * @typedef {Object} ModuleOptions
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

class AkairoModule {
    /**
     * Creates a new module.
     * @param {string} id - ID.
     * @param {function} exec - Function <code>((message, args) => {})</code> called when module is used.
     * @param {ModuleOptions} [options={}] - Options.
     */
    constructor(id, exec, options = {}){
        /**
         * ID of the module.
         * @type {string}
         */
        this.id = id;

        /**
         * Category this module belongs to.
         * @type {Category}
         */
        this.category = options.category || 'default';

        /**
         * Function called for module.
         * @type {function}
         */
        this.exec = exec;

        /**
         * Whether or not this module is enabled.
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * Path to module file.
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
    }

    /**
     * Reloads the module.
     */
    reload(){
        this.handler.reload(this.id);
    }

    /**
     * Removes the module. It can be readded with its handler.
     */
    remove(){
        this.handler.remove(this.id);
    }

    /**
     * Enables the module.
     */
    enable(){
        if (this.enabled) return;
        this.enabled = true;
        this.handler.emit(AkairoHandlerEvents.ENABLE, this);
    }

    /**
     * Disables the module.
     */
    disable(){
        if (!this.enabled) return;
        this.enabled = false;
        this.handler.emit(AkairoHandlerEvents.DISABLE, this);
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString(){
        return this.id;
    }
}

module.exports = AkairoModule;
