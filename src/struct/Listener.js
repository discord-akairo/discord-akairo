const AkairoModule = require('./AkairoModule');

/**
 * Represents a listener.
 * @param {string} id - Listener ID.
 * @param {ListenerExecFunction} exec - The function called when event emitted.
 * @param {ListenerOptions} [options={}] - Options for the listener.
 * @extends {AkairoModule}
 */
class Listener extends AkairoModule {
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

        super(id, exec, options);

        /**
         * The event emitter.
         * @type {string|EventEmitter}
         */
        this.emitter = options.emitter || 'client';

        /**
         * The event name listened to.
         * @type {string}
         */
        this.eventName = options.eventName || 'ready';

        /**
         * Type of listener.
         * @type {string}
         */
        this.type = options.type || 'on';

        /**
         * Executes the listener.
         * @method
         * @name Listener#exec
         * @param {...args} [args] - Arguments.
         * @returns {any}
         */
        this.exec = this.exec.bind(this);

        /**
         * The ID of this listener.
         * @name Listener#id
         * @type {string}
         */

        /**
         * The listener handler.
         * @readonly
         * @name Listener#handler
         * @type {ListenerHandler}
         */
    }

    /**
     * Enables the listener.
     * @returns {boolean}
     */
    enable() {
        if (!super.enable()) return false;
        this.handler.register(this.id);
        return true;
    }

    /**
     * Disables the listener.
     * @returns {boolean}
     */
    disable() {
        if (!super.disable()) return false;
        this.handler.deregister(this.id);
        return true;
    }

    /**
     * Reloads the listener.
     * @method
     * @name Listener#reload
     * @returns {Listener}
     */

    /**
     * Removes the listener.
     * @method
     * @name Listener#remove
     * @returns {Listener}
     */
}

module.exports = Listener;

/**
 * Options to use for listener execution behavior.
 * @typedef {Object} ListenerOptions
 * @prop {string|EventEmitter} [emitter='client'] - The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
 * @prop {string} [eventName='ready'] - Event name to listen to.
 * @prop {string} [type='on'] - Type of listener, either 'on' or 'once'.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

/**
 * Function called when event emitted.
 * @typedef {Function} ListenerExecFunction
 * @param {...args} [args] - Arguments.
 * @returns {any}
 */
