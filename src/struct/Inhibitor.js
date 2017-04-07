const AkairoModule = require('./AkairoModule');

/**
 * Options to use for inhibitor execution behavior.
 * @typedef {Object} InhibitorOptions
 * @prop {string} [reason=''] - Reason emitted when command or message is blocked.
 * @prop {boolean} [type='post'] - Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are commands.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

/** @extends AkairoModule */
class Inhibitor extends AkairoModule {
    /**
     * Creates a new Inhibitor.
     * @param {string} id - Inhibitor ID.
     * @param {Function} exec - Function `((message, command) => boolean)` called before a command is ran.
     * Return `true` or a rejecting Promise to block.
     * @param {InhibitorOptions} [options={}] - Options for the inhibitor.
     */
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

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
         * @returns {any}
         */

        /**
         * The inhibitor handler.
         * @readonly
         * @name Inhibitor#handler
         * @type {InhibitorHandler}
         */
    }

    /**
     * Reloads the inhibitor.
     * @method
     * @name Inhibitor#reload
     * @returns {Inhibitor}
     */

    /**
     * Removes the inhibitor.
     * @method
     * @name Inhibitor#remove
     * @returns {Inhibitor}
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
