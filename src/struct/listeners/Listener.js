class Listener {
    /**
     * Creates a new Listener.
     * @param {string} id - Listener ID.
     * @param {string|EventEmitter} emitter - The event emitter: 'client' or 'commandHandler' or an EventEmitter.
     * @param {string} eventName - Event to listen to.
     * @param {string} type - Type of listener: 'on' or 'once'.
     * @param {function} exec - The function (<code>(...) => {}</code>) called when event emitted.
     */
    constructor(id, emitter, eventName, type, exec){
        /**
         * ID of the Listener.
         * @type {string}
         */
        this.id = id;

        /**
         * The event emitter.
         * @type {string|EventEmitter}
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
        this.exec = exec.bind(this);

        /**
         * Whether or not this listener is enabled.
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * Path to Listener file.
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
         * The listener handler.
         * @readonly
         * @type {ListenerHandler}
         */
        this.listenerHandler = null;
    }

    /**
     * Reloads the Listener.
     */
    reload(){
        this.listenerHandler.reload(this.id);
    }

    /**
     * Removes the Listener. It can be readded with the listener handler.
     */
    remove(){
        this.listenerHandler.remove(this.id);
    }

    /**
     * Enables the listener.
     */
    enable(){
        if (this.enabled) return;

        this.listenerHandler.register(this.id);
        this.enabled = true;
    }

    /**
     * Disables the listener.
     */
    disable(){
        if (!this.enabled) return;

        this.listenerHandler.deregister(this.id);
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

module.exports = Listener;