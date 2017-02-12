const AkairoModule = require('./AkairoModule');

/**
 * Options to use for inhibitor execution behavior.
 * @typedef {Object} InhibitorOptions
 * @prop {string} [reason=''] - Reason emitted when command or message is blocked.
 * @prop {boolean} [type='post'] - Set to 'pre' to make this run before the message is handled rather than after.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

/** @extends AkairoModule */
class Inhibitor extends AkairoModule {
    /**
     * Creates a new Inhibitor.
     * @param {string} id - Inhibitor ID.
     * @param {function} exec - Function <code>((message, command) => {})</code> called before a command is ran.<br/>Return true or a rejecting Promise to block.
     * @param {InhibitorOptions} [options={}] - Options for the inhibitor.
     */
    constructor(id, exec, options = {}){
        super(id, exec, options);

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
         * The ID of this inhibitor.
         * @name Inhibitor#id
         * @type {string}
         */

        /**
         * Executes the inhibitor.
         * @method
         * @name Inhibitor#exec
         * @returns {*}
         */

        /**
         * The inhibitor handler.
         * @readonly
         * @name Inhibitor#handler
         * @type {InhibitorHandler}
         */
    }

    /**
     * The inhibitor handler.<br/>Alias to this.handler.
     * @readonly
     * @type {InhibitorHandler}
     */
    get inhibitorHandler(){
        return this.handler;
    }

    /**
     * Reloads the inhibitor.
     * @method
     * @name Inhibitor#reload
     */

    /**
     * Removes the inhibitor.
     * @method
     * @name Inhibitor#reload
     */

    /**
     * Enables the inhibitor.
     * @method
     * @name Inhibitor#enable
     * @returns {boolean}
     */

    /**
     * Disables the inhibitor.
     * @method
     * @name Inhibitor#disable
     * @returns {boolean}
     */
}

module.exports = Inhibitor;
