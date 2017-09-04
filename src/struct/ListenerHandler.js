const AkairoHandler = require('./AkairoHandler');
const { Collection } = require('discord.js');
const Listener = require('./Listener');
const { isEventEmitter } = require('../util/Util');

/** @extends AkairoHandler */
class ListenerHandler extends AkairoHandler {
    /**
     * Loads listeners and registers them with EventEmitters.
     * @param {AkairoClient} client - The Akairo client.
     */
    constructor(client) {
        const { listenerDirectory, emitters } = client.akairoOptions;
        super(client, listenerDirectory, Listener);

        /**
         * EventEmitters for use, mapped by name to EventEmitter.
         * By default, 'client', 'commandHandler', 'inhibitorHandler', 'listenerHandler' are set.
         * Databases added through the client are also added here.
         * @type {Collection<string, EventEmitter>}
         */
        this.emitters = new Collection();
        this.emitters.set('client', this.client);
        this.emitters.set('commandHandler', this.client.commandHandler);
        this.emitters.set('inhibitorHandler', this.client.inhibitorHandler);
        this.emitters.set('listenerHandler', this.client.listenerHandler);

        if (emitters) {
            for (const [key, value] of Object.entries(emitters)) {
                if (this.emitters.has(key)) continue;
                if (!isEventEmitter(value)) throw new Error(`Emitter ${key} is not an EventEmitter`);
                this.emitters.set(key, value);
            }
        }

        /**
         * Directory to listeners.
         * @readonly
         * @name ListenerHandler#directory
         * @type {string}
         */

        /**
         * Listeners loaded, mapped by ID to Listener.
         * @name ListenerHandler#modules
         * @type {Collection<string, Listener>}
         */
    }

    /**
     * Registers a module.
     * @private
     * @param {Listener} listener - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    _apply(listener, filepath) {
        super._apply(listener, filepath);
        this.register(listener.id);
        return listener;
    }

    /**
     * Deregisters a module.
     * @private
     * @param {Listener} listener - Module to use.
     * @returns {void}
     */
    _unapply(listener) {
        this.deregister(listener.id);
        super._unapply(listener);
    }

    /**
     * Adds a listener to the EventEmitter.
     * @param {string} id - ID of the listener.
     * @returns {Listener}
     */
    register(id) {
        const listener = this.modules.get(id.toString());
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        const emitter = isEventEmitter(listener.emitter) ? listener.emitter : this.emitters.get(listener.emitter);
        if (!isEventEmitter(emitter)) throw new Error('Listener\'s emitter is not an EventEmitter');

        if (listener.type === 'once') {
            emitter.once(listener.event, listener.exec);
            return listener;
        }

        emitter.on(listener.event, listener.exec);
        return listener;
    }

    /**
     * Removes a listener from the EventEmitter.
     * @param {string} id - ID of the listener.
     * @returns {Listener}
     */
    deregister(id) {
        const listener = this.modules.get(id.toString());
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        const emitter = isEventEmitter(listener.emitter) ? listener.emitter : this.emitters.get(listener.emitter);
        if (!isEventEmitter(emitter)) throw new Error('Listener\'s emitter is not an EventEmitter');

        emitter.removeListener(listener.event, listener.exec);
        return listener;
    }

    /**
     * Loads a listener.
     * @method
     * @name ListenerHandler#load
     * @param {string|Listener} thing - Module or path to module.
     * @returns {Listener}
     */

    /**
     * Reads all listeners from the directory and loads them.
     * @method
     * @name ListenerHandler#loadAll
     * @returns {ListenerHandler}
     */

    /**
     * Adds a listener.
     * @method
     * @name ListenerHandler#add
     * @param {string} filename - Filename to lookup in the directory.
     * A .js extension is assumed if one is not given.
     * @returns {Listener}
     */

    /**
     * Removes a listener.
     * @method
     * @name ListenerHandler#remove
     * @param {string} id - ID of the listener.
     * @returns {Listener}
     */

    /**
     * Removes all listeners.
     * @method
     * @name ListenerHandler#removeAll
     * @returns {ListenerHandler}
     */

    /**
     * Reloads a listener.
     * @method
     * @name ListenerHandler#reload
     * @param {string} id - ID of the listener.
     * @returns {Listener}
     */

    /**
     * Reloads all listeners.
     * @method
     * @name ListenerHandler#reloadAll
     * @returns {ListenerHandler}
     */
}

module.exports = ListenerHandler;

/**
 * Emitted when a listener is loaded.
 * @event ListenerHandler#load
 * @param {Listener} listener - Listener loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a listener is removed.
 * @event ListenerHandler#remove
 * @param {Listener} listener - Listener removed.
 */

/**
 * Emitted when a listener is enabled.
 * @event ListenerHandler#enable
 * @param {Listener} listener - Listener enabled.
 */

/**
 * Emitted when a listener is disabled.
 * @event ListenerHandler#disable
 * @param {Listener} listener - Listener disabled.
 */
