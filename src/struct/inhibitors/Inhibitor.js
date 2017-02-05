/**
 * Options to use for inhibitor execution behavior.
 * @typedef {Object} InhibitorOptions
 * @prop {string} [reason=''] - Reason emitted when command or message is blocked.
 * @prop {boolean} [type='post'] - Set to 'pre' to make this run before the message is handled rather than after.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

class Inhibitor {
    /**
     * Creates a new Inhibitor.
     * @param {string} id - Inhibitor ID.
     * @param {function} exec - Function <code>((message, command) => {})</code> called before a command is ran. Return true or a rejecting Promise to block.
     * @param {InhibitorOptions} [options={}] - Options for the inhibitor.
     */
    constructor(id, exec, options = {}){
        /**
         * ID of the inhibitor.
         * @type {string}
         */
        this.id = id;

        /**
         * Reason emitted when command is inhibited.
         * @type {string}
         */
        this.reason = options.reason || '';

        /**
         * When the inhibitor is ran.
         * @type {string}
         */
        this.type = options.type || 'post';

        /**
         * Category this inhibitor belongs to.
         * @type {Category}
         */
        this.category = options.category || 'default';

        /**
         * Function called to inhibit.
         * @type {function}
         */
        this.exec = exec;

        /**
         * Whether or not this inhibitor is enabled.
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * Path to inhibitor file.
         * @readonly
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Akairo framework.
         * @readonly
         * @type {Framework}
         */
        this.framework = null;

        /**
         * The Discord.js client.
         * @readonly
         * @type {Client}
         */
        this.client = null;

        /**
         * The inhibitor handler.
         * @readonly
         * @type {InhibitorHandler}
         */
        this.inhibitorHandler = null;
    }

    /**
     * Reloads the inhibitor.
     */
    reload(){
        this.inhibitorHandler.reload(this.id);
    }
    
    /**
     * Removes the inhibitor. It can be readded with the inhibitor handler.
     */
    remove(){
        this.inhibitorHandler.remove(this.id);
    }

    /**
     * Enables the inhibitor.
     */
    enable(){
        if (this.enabled) return;
        this.enabled = true;
    }

    /**
     * Disables the inhibitor.
     */
    disable(){
        if (!this.enabled) return;
        this.enabled = false;
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString(){
        return this.id;
    }
}

module.exports = Inhibitor;
