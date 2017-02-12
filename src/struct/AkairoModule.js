const { AkairoHandlerEvents } = require('../utils/Constants');

/**
 * Options for module.
 * @typedef {Object} ModuleOptions
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

class AkairoModule {
    /**
     * Creates a new module.
     * @param {string} id - ID of module.
     * @param {function} exec - Function called when module is used.
     * @param {ModuleOptions} [options={}] - Options.
     */
    constructor(id, exec, options = {}){
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
         * Function called for module.
         * @type {function}
         */
        this.exec = exec;

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
    }

    /**
     * Reloads this.
     */
    reload(){
        this.handler.reload(this.id);
    }

    /**
     * Removes this.<br/>It can be readded with its handler.
     */
    remove(){
        this.handler.remove(this.id);
    }

    /**
     * Enables this.
     */
    enable(){
        if (this.enabled) return;
        this.enabled = true;
        this.handler.emit(AkairoHandlerEvents.ENABLE, this);
    }

    /**
     * Disables this.
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
