const path = require('path');
const rread = require('readdir-recursive');
const Collection = require('discord.js').Collection;
const Inhibitor = require('./Inhibitor');

/** @extends EventEmitter */
class InhibitorHandler {
    /**
     * Loads Commands and Inhibitors and handles messages.
     * @param {Framework} framework - The Akairo framework.
     * @param {Object} options - Options from framework.
     */
    constructor(framework, options = {}){
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

        let filepaths = rread.fileSync(this.directory);
        filepaths.forEach(filepath => {
            this.load(filepath);
        });
    }

    /**
     * Loads an Inhibitor.
     * @param {string} filepath - Path to file.
     */
    load(filepath){
        let inhibitor = require(filepath);

        if (!(inhibitor instanceof Inhibitor)) return;
        if (this.inhibitors.has(inhibitor.id)) throw new Error(`Inhibitor ${inhibitor.id} already loaded.`);

        inhibitor.filepath = filepath;
        inhibitor.framework = this.framework;
        inhibitor.client = this.framework.client;
        inhibitor.handler = this;

        this.inhibitors.set(inhibitor.id, inhibitor);
    }

    /**
     * Adds an Inhibitor.
     * @param {string} filename - Filename to lookup in the directory. A .js extension is assumed.
     */
    add(filename){
        let files = rread.fileSync(this.directory);
        let filepath = files.find(file => file.endsWith(`${filename}.js`));

        if (!filepath){
            throw new Error(`File ${filename} not found.`);
        }

        this.load(filepath);
    }

    /**
     * Removes an Inhibitor.
     * @param {string} id - ID of the Inhibitor.
     */
    removeInhibitor(id){
        let inhibitor = this.inhibitors.get(id);
        if (!inhibitor) throw new Error(`Inhibitor ${id} does not exist.`);

        delete require.cache[require.resolve(inhibitor.filepath)];
        this.inhibitors.delete(inhibitor.id);
    }

    /**
     * Reloads an Inhibitor.
     * @param {string} id - ID of the Inhibitor.
     */
    reloadInhibitor(id){
        let inhibitor = this.inhibitors.get(id);
        if (!inhibitor) throw new Error(`Inhibitor ${id} does not exist.`);

        let filepath = inhibitor.filepath;

        delete require.cache[require.resolve(inhibitor.filepath)];
        this.inhibitors.delete(inhibitor.id);
        
        this.load(filepath);
    }

    /**
     * Tests the pre-message inhibitors against the message. Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @returns {Promise.<string>}
     */
    testMessage(message){
        return new Promise((resolve, reject) => {
            let promises = this.inhibitors.filter(i => i.preMessage).map(inhibitor => {
                let inhibited = inhibitor.exec(message);

                if (inhibited instanceof Promise) return inhibited.catch(err => {
                    if (err instanceof Error) throw err;
                    throw inhibitor.reason;
                });
                
                if (!inhibited) return Promise.resolve();
                return Promise.reject(inhibitor.reason);
            });

            Promise.all(promises).then(resolve).catch(errOrReason => {
                if (errOrReason instanceof Error) throw errOrReason;
                reject(errOrReason);
            });
        });
    }

    /**
     * Tests the post-message inhibitors against the message and command. Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @param {Command} command - Command to test.
     * @returns {Promise.<string>}
     */
    testCommand(message, command){
        return new Promise((resolve, reject) => {
            let promises = this.inhibitors.filter(i => !i.preMessage).map(inhibitor => {
                let inhibited = inhibitor.exec(message, command);

                if (inhibited instanceof Promise) return inhibited.catch(err => {
                    if (err instanceof Error) throw err;
                    throw inhibitor.reason;
                });
                
                if (!inhibited) return Promise.resolve();
                return Promise.reject(inhibitor.reason);
            });

            Promise.all(promises).then(resolve).catch(errOrReason => {
                if (errOrReason instanceof Error) throw errOrReason;
                reject(errOrReason);
            });
        });
    }
}

module.exports = InhibitorHandler;