const path = require('path');
const EventEmitter = require('events');
const rread = require('readdir-recursive');
const { Collection } = require('discord.js');
const Listener = require('./Listener');
const Category = require('../utils/Category');
const { ListenerHandlerEvents } = require('../utils/Constants');

/** @extends EventEmitter */
class ListenerHandler extends EventEmitter {
    /**
     * Loads listeners and register them with EventEmitters.
     * @param {Framework} framework - The Akairo framework.
     * @param {Object} options - Options from framework.
     */
    constructor(framework, options){
        super();

        /**
         * The Akairo framework.
         * @readonly
         * @type {Framework}
         */
        this.framework = framework;

        /**
         * Directory to listeners.
         * @readonly
         * @type {string}
         */
        this.directory = path.resolve(options.listenerDirectory);

        /**
         * EventEmitters for use, mapped by name to EventEmitter. 'client', 'commandHandler', 'inhibitorHandler', 'listenerHandler' are set by default.
         * @type {Collection.<string, EventEmitter>}
         */
        this.emitters = new Collection();
        this.emitters.set('client', this.framework.client);
        this.emitters.set('commandHandler', this.framework.commandHandler);
        this.emitters.set('inhibitorHandler', this.framework.inhibitorHandler);
        this.emitters.set('listenerHandler', this.framework.listenerHandler);

        if (options.emitters) Object.keys(options.emitters).forEach(key => {
            if (this.emitters.has(key)) return;
            this.emitters.set(key, options.emitters[key]);
        });

        /**
         * Listeners loaded, mapped by ID to Listener.
         * @type {Collection.<string, Listener>}
         */
        this.listeners = new Collection();

        /**
         * Listener categories, mapped by ID to Category.
         * @type {Collection.<string, Category>}
         */
        this.categories = new Collection();

        const filepaths = rread.fileSync(this.directory);
        filepaths.forEach(filepath => {
            this.load(filepath);
        });
    }

    /**
     * Loads a listener.
     * @param {string} filepath - Path to file.
     * @returns {Listener}
     */
    load(filepath){
        const listener = require(filepath);

        if (!(listener instanceof Listener)) return;
        if (this.listeners.has(listener.id)) throw new Error(`Listener ${listener.id} already loaded.`);

        listener.filepath = filepath;
        listener.framework = this.framework;
        listener.client = this.framework.client;
        listener.listenerHandler = this;

        this.listeners.set(listener.id, listener);
        this.register(listener.id);

        if (!this.categories.has(listener.category)) this.categories.set(listener.category, new Category(listener.category));
        const category = this.categories.get(listener.category);
        listener.category = category;
        category.set(listener.id, listener);

        return listener;
    }

    /**
     * Adds a listener.
     * @param {string} filename - Filename to lookup in the directory.
     */
    add(filename){
        const files = rread.fileSync(this.directory);
        const filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.emit(ListenerHandlerEvents.ADD, this.load(filepath));
    }

    /**
     * Removes a listener.
     * @param {string} id - ID of the listener.
     */
    remove(id){
        const listener = this.listeners.get(id);
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        delete require.cache[require.resolve(listener.filepath)];
        this.deregister(listener.id);
        this.listeners.delete(listener.id);

        listener.category.delete(listener.id);

        this.emit(ListenerHandlerEvents.REMOVE, listener);
    }

    /**
     * Reloads a listener.
     * @param {string} id - ID of the listener.
     */
    reload(id){
        const listener = this.listeners.get(id);
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        const filepath = listener.filepath;

        delete require.cache[require.resolve(listener.filepath)];
        this.deregister(listener.id);
        this.listeners.delete(listener.id);

        listener.category.delete(listener.id);
        
        this.emit(ListenerHandlerEvents.REMOVE, this.load(filepath));
    }

    /**
     * Reloads all listeners.
     */
    reloadAll(){
        this.listeners.forEach(l => l.reload());
    }
    
    /**
     * Registers a listener with the EventEmitter.
     * @param {string} id - ID of the listener.
     */
    register(id){
        const listener = this.listeners.get(id);
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);
        if (!(emitter instanceof EventEmitter)) throw new Error('Listener\'s emitter is not an EventEmitter');

        if (listener.type === 'once'){
            return emitter.once(listener.eventName, listener.exec);
        }

        emitter.on(listener.eventName, listener.exec);
    }

    /**
     * Removes a listener from the EventEmitter.
     * @param {string} id - ID of the listener.
     */
    deregister(id){
        const listener = this.listeners.get(id);
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);
        if (!(emitter instanceof EventEmitter)) throw new Error('Listener\'s emitter is not an EventEmitter');

        emitter.removeListener(listener.eventName, listener.exec);
    }
}

module.exports = ListenerHandler;

/**
 * Emitted when an listener is added.
 * @event ListenerHandler#add
 * @param {Listener} listener - Listener added.
 */

/**
 * Emitted when an listener is removed.
 * @event ListenerHandler#remove
 * @param {Listener} listener - Listener removed.
 */

/**
 * Emitted when an listener is reloaded.
 * @event ListenerHandler#reload
 * @param {Listener} listener - Listener reloaded.
 */
