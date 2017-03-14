const AkairoHandler = require('./AkairoHandler');
const Inhibitor = require('./Inhibitor');

/** @extends AkairoHandler */
class InhibitorHandler extends AkairoHandler {
    /**
     * Loads inhibitors and checks messages.
     * @param {AkairoClient} client - The Akairo client.
     * @param {Object} options - Options from client.
     */
    constructor(client, options = {}){
        super(client, options.inhibitorDirectory, Inhibitor);

        /**
         * Directory to inhibitors.
         * @readonly
         * @name InhibitorHandler#directory
         * @type {string}
         */

        /**
         * Inhibitors loaded, mapped by ID to Inhibitor.
         * @name InhibitorHandler#modules
         * @type {Collection.<string, Inhibitor>}
         */
    }

    /**
     * Tests the pre-message inhibitors against the message.
     * <br>Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @returns {Promise.<string>}
     */
    testMessage(message){
        const promises = this.modules.filter(i => i.type === 'pre' && i.enabled).map(inhibitor => {
            const inhibited = inhibitor.exec(message);

            if (inhibited instanceof Promise) return inhibited.catch(err => {
                if (err instanceof Error) throw err;
                return Promise.reject(inhibitor.reason);
            });
            
            if (!inhibited) return Promise.resolve();
            return Promise.reject(inhibitor.reason);
        });

        return Promise.all(promises);
    }

    /**
     * Tests the post-message inhibitors against the message and command.
     * <br>Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @param {Command} command - Command to test.
     * @returns {Promise.<string>}
     */
    testCommand(message, command){
        const promises = this.modules.filter(i => i.type === 'post' && i.enabled).map(inhibitor => {
            const inhibited = inhibitor.exec(message, command);

            if (inhibited instanceof Promise) return inhibited.catch(err => {
                if (err instanceof Error) throw err;
                return Promise.reject(inhibitor.reason);
            });
            
            if (!inhibited) return Promise.resolve();
            return Promise.reject(inhibitor.reason);
        });

        return Promise.all(promises);
    }

    /**
     * Loads an inhibitor.
     * @method
     * @param {string} filepath - Path to file.
     * @name InhibitorHandler#load
     * @returns {Inhibitor}
     */

    /**
     * Adds an inhibitor.
     * @method
     * @param {string} filename - Filename to lookup in the directory.
     * <br>A .js extension is assumed.
     * @name InhibitorHandler#add
     * @returns {Inhibitor}
     */

    /**
     * Removes an inhibitor.
     * @method
     * @param {string} id - ID of the inhibitor.
     * @name InhibitorHandler#remove
     * @returns {Inhibitor}
     */

    /**
     * Reloads an inhibitor.
     * @method
     * @param {string} id - ID of the inhibitor.
     * @name InhibitorHandler#reload
     * @returns {Inhibitor}
     */

    /**
     * Reloads all inhibitors.
     * @method
     * @name InhibitorHandler#reloadAll
     */
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

/**
 * Emitted when an inhibitor is enabled.
 * @event InhibitorHandler#enable
 * @param {Inhibitor} inhibitor - Inhibitor enabled.
 */

/**
 * Emitted when an inhibitor is disabled.
 * @event InhibitorHandler#disable
 * @param {Inhibitor} inhibitor - Inhibitor disabled.
 */
