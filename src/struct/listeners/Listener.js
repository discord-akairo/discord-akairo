const AkairoModule = require('../AkairoModule');

/**
 * Options to use for listener execution behavior.
 * @typedef {Object} ListenerOptions
 * @prop {string|EventEmitter} [emitter='client'] - The event emitter, either a key from listenerHandler.emitters or an EventEmitter.
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
    }

    /**
     * The listener handler.
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
