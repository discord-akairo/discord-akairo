const AkairoError = require('../util/AkairoError');
const AkairoModule = require('./AkairoModule');

/**
 * Options to use for listener execution behavior.
 * @typedef {Object} ListenerOptions
 * @prop {string|EventEmitter} [emitter='client'] - The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
 * @prop {string} [event='ready'] - Event name to listen to.
 * @prop {string} [type='on'] - Type of listener, either 'on' or 'once'.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

/** @extends AkairoModule */
class Listener extends AkairoModule {
    /**
     * Creates a new Listener.
     * @param {string} id - Listener ID.
     * @param {ListenerOptions} [options={}] - Options for the listener.
     */
    constructor(id, options = {}) {
        super(id, options);

        const {
            emitter = 'client',
            event = 'ready',
            type = 'on'
        } = options;

        /**
         * The event emitter.
         * @type {string|EventEmitter}
         */
        this.emitter = emitter;

        /**
         * The event name listened to.
         * @type {string}
         */
        this.event = event;

        /**
         * Type of listener.
         * @type {string}
         */
        this.type = type;

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
     * Executes the listener.
     * @abstract
     * @param {...args} [args] - Arguments.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
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
