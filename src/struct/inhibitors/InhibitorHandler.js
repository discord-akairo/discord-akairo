const path = require('path');
const EventEmitter = require('events');
const rread = require('readdir-recursive');
const { Collection } = require('discord.js');
const Inhibitor = require('./Inhibitor');
const { InhibitorHandlerEvents } = require('../utils/Constants');

/** @extends EventEmitter */
class InhibitorHandler extends EventEmitter {
    /**
     * Loads Inhibitors and checks messages.
     * @param {Framework} framework - The Akairo framework.
     * @param {Object} options - Options from framework.
     */
    constructor(framework, options = {}){
        super();

        /**
         * The Akairo framework.
         * @readonly
         * @type {Framework}
         */
        this.framework = framework;

        /**
         * Directory to inhibitors.
         * @readonly
         * @type {string}
         */
        this.directory = path.resolve(options.inhibitorDirectory);

        /**
         * Inhibitors loaded, mapped by ID to Inhibitor.
         * @type {Collection.<string, Inhibitor>}
         */
        this.inhibitors = new Collection();

        const filepaths = rread.fileSync(this.directory);
        filepaths.forEach(filepath => {
            this.load(filepath);
        });
    }

    /**
     * Loads an Inhibitor.
     * @param {string} filepath - Path to file.
     * @returns {Inhibitor}
     */
    load(filepath){
        const inhibitor = require(filepath);

        if (!(inhibitor instanceof Inhibitor)) return;
        if (this.inhibitors.has(inhibitor.id)) throw new Error(`Inhibitor ${inhibitor.id} already loaded.`);

        inhibitor.filepath = filepath;
        inhibitor.framework = this.framework;
        inhibitor.client = this.framework.client;
        inhibitor.inhibitorHandler = this;

        this.inhibitors.set(inhibitor.id, inhibitor);
        return inhibitor;
    }

    /**
     * Adds an Inhibitor.
     * @param {string} filename - Filename to lookup in the directory. A .js extension is assumed.
     */
    add(filename){
        const files = rread.fileSync(this.directory);
        const filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.emit(InhibitorHandlerEvents.ADD, this.load(filepath));
    }

    /**
     * Removes an Inhibitor.
     * @param {string} id - ID of the Inhibitor.
     */
    remove(id){
        const inhibitor = this.inhibitors.get(id);
        if (!inhibitor) throw new Error(`Inhibitor ${id} does not exist.`);

        delete require.cache[require.resolve(inhibitor.filepath)];
        this.inhibitors.delete(inhibitor.id);

        this.emit(InhibitorHandlerEvents.REMOVE, inhibitor);
    }

    /**
     * Reloads an Inhibitor.
     * @param {string} id - ID of the Inhibitor.
     */
    reload(id){
        const inhibitor = this.inhibitors.get(id);
        if (!inhibitor) throw new Error(`Inhibitor ${id} does not exist.`);

        const filepath = inhibitor.filepath;

        delete require.cache[require.resolve(inhibitor.filepath)];
        this.inhibitors.delete(inhibitor.id);
        
        this.emit(InhibitorHandlerEvents.RELOAD, this.load(filepath));
    }

    /**
     * Tests the pre-message inhibitors against the message. Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @returns {Promise.<string>}
     */
    testMessage(message){
        const promises = this.inhibitors.filter(i => i.type === 'pre' && i.enabled).map(inhibitor => {
            const inhibited = Promise.resolve(inhibitor.exec(message));
            return inhibited;
        });

        return Promise.all(promises).catch(errOrReason => {
            if (errOrReason instanceof Error) throw errOrReason;
            return errOrReason;
        });
    }

    /**
     * Tests the post-message inhibitors against the message and command. Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @param {Command} command - Command to test.
     * @returns {Promise.<string>}
     */
    testCommand(message, command){
        const promises = this.inhibitors.filter(i => i.type === 'pre' && i.enabled).map(inhibitor => {
            const inhibited = Promise.resolve(inhibitor.exec(message, command));
            return inhibited;
        });

        return Promise.all(promises).catch(errOrReason => {
            if (errOrReason instanceof Error) throw errOrReason;
            return errOrReason;
        });
    }
}

module.exports = InhibitorHandler;

/**
 * Emitted when an inhibitor is added.
 * @event InhibitorHandler#add
 * @param {Inhibitor} inhibitor - Inhibitor added.
 */

/**
 * Emitted when an inhibitor is removed.
 * @event InhibitorHandler#remove
 * @param {Inhibitor} inhibitor - Inhibitor removed.
 */

/**
 * Emitted when an inhibitor is reloaded.
 * @event InhibitorHandler#reload
 * @param {Inhibitor} inhibitor - Inhibitor reloaded.
 */
