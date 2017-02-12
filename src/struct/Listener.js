const AkairoModule = require('./AkairoModule');

/**
 * Options to use for listener execution behavior.
 * @typedef {Object} ListenerOptions
 * @prop {string|EventEmitter} [emitter='client'] - The event emitter, either a key from ListenerHandler#emitters or an EventEmitter.
 * @prop {string} [eventName='ready'] - Event name to listen to.
 * @prop {string} [type='on'] - Type of listener: 'on' or 'once'.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */

/** @extends AkairoModule */
class Listener extends AkairoModule {
    /**
     * Creates a new Listener.
     * @param {string} id - Listener ID.
     * @param {function} exec - The function <code>((...) => {})</code> called when event emitted.
     * @param {ListenerOptions} [options={}] - Options for the listener.
     */
    constructor(id, exec, options = {}){
        super(id, exec, options);

        /**
         * Function called when listener is ran.
         * @type {function}
         */
        this.exec = this.exec.bind(this);

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

        // The properties below are from AkairoModule.
        // They are only here for documentation purposes.

        /**
         * The ID of this listener.
         * @type {string}
         */
        this.id;

        /**
         * The listener handler.
         * @readonly
         * @type {ListenerHandler}
         */
        this.handler;
    }

    /**
     * The listener handler. Alias to this.handler.
     * @type {ListenerHandler}
     */
    get listenerHandler(){
        return this.handler;
    }

    /**
     * Enables the listener.
     */
    enable(){
        super.enable();
        this.listenerHandler.register(this.id);
    }

    /**
     * Disables the listener.
     */
    disable(){
        super.disable();
        this.listenerHandler.deregister(this.id);
    }
}

module.exports = Listener;
