const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

/**
 * Represents a listener.
 * @param {string} id - Listener ID.
 * @param {ListenerOptions} [options={}] - Options for the listener.
 * @extends {AkairoModule}
 */
class Listener extends AkairoModule {
    constructor(id, {
        category,
        emitter,
        event,
        type = 'on'
    } = {}) {
        super(id, { category });

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
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions} ListenerOptions
 * @prop {string|EventEmitter} emitter - The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
 * @prop {string} event - Event name to listen to.
 * @prop {string} [type='on'] - Type of listener, either 'on' or 'once'.
 */
