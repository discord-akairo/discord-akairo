const AkairoModule = require('./AkairoModule');

/**
 * Options to use for inhibitor execution behavior.
 * @typedef {Object} InhibitorOptions
 * @prop {string} [reason=''] - Reason emitted when command or message is blocked.
 * @prop {boolean} [type='post'] - Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are commands.
 * @prop {number} [priority=0] - Priority for the inhibitor for when more than one inhibitors block a message.
 * The inhibitor with the highest priority is the one that is used for the block reason.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

/**
 * Function to check if message should be blocked.
 * A return value of true will block the message.
 * If returning a Promise, a resolved value of true wil block the message.
 * @typedef {Function} InhibitorExecFunction
 * @param {Message} message - Message being handled.
 * @param {Command} [command] - Command to check.
 * @returns {boolean|Promise<any>}
 */

/** @extends AkairoModule */
class Inhibitor extends AkairoModule {
    /**
     * Creates a new Inhibitor.
     * @param {string} id - Inhibitor ID.
     * @param {InhibitorExecFunction} exec - Function called before a command is ran.
     * @param {InhibitorOptions} [options={}] - Options for the inhibitor.
     */
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

        super(id, exec, options);

        const {
            reason = '',
            type = 'post',
            priority = 0
        } = options;

        /**
         * Reason emitted when command is inhibited.
         * @type {string}
         */
        this.reason = reason;

        /**
         * The type of the inhibitor for when it should run.
         * @type {string}
         */
        this.type = type;

        /**
         * The priority of the inhibitor.
         * @type {number}
         */
        this.priority = priority;

        /**
         * The ID of this inhibitor.
         * @name Inhibitor#id
         * @type {string}
         */

        /**
         * Executes the inhibitor.
         * @method
         * @name Inhibitor#exec
         * @param {Message} message - Message being handled.
         * @param {Command} [command] - Command to check.
         * @returns {boolean|Promise<any>}
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
