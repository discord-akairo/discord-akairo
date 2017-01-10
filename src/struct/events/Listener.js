class Listener {
    /**
     * Creates a new Listener.
     * @param {string} id Listener ID.
     * @param {(string|EventEmitter)} emitter The event emitter: 'client' or 'commandHandler' or an EventEmitter.
     * @param {string} eventName Event to listen to.
     * @param {string} type Type of listener: 'on' or 'once'.
     * @param {function} exec The function called when event emitted. (...)
     */
    constructor(id, emitter, eventName, type, exec){
        /**
         * ID of the Listener.
         * @type {string}
         */
        this.id = id;

        /**
         * The event emitter.
         * @type {(string|EventEmitter)}
         */
        this.emitter = emitter;

        /**
         * The event name listened to.
         * @type {string}
         */
        this.eventName = eventName;

        /**
         * Type of listener.
         * @type {string}
         */
        this.type = type;

        /**
         * The function called when event emitted.
         * @type {function}
         */
        this.exec = exec;

        /**
         * Path to Listener file.
         * @type {?string}
         */
        this.filepath;

        /**
         * The Akairo framework.
         * @type {?Framework}
         */
        this.framework;

        /**
         * The listener handler.
         * @type {?ListenerHandler}
         */
        this.listenerHandler;
    }

    /**
     * Reloads the Listener.
     */
    reload(){
        this.listenerHandler.reloadListener(this.id);
    }

    /**
     * Removes the Listener. It can be readded with the listener handler.
     */
    remove(){
        this.listenerHandler.removeListener(this.id);
    }
}

module.exports = Listener;