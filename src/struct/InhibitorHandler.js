const AkairoHandler = require('./AkairoHandler');
const Inhibitor = require('./Inhibitor');

/**
 * Loads inhibitors and checks messages.
 * @param {AkairoClient} client - The Akairo client.
 * @param {Object} options - Options from client.
 * @extends {AkairoHandler}
 */
class InhibitorHandler extends AkairoHandler {
    constructor(client, options = {}) {
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
         * @type {Collection<string, Inhibitor>}
         */
    }

    /**
     * Tests inhibitors against the message.
     * Rejects with the reason if blocked.
     * @param {string} type - Type of inhibitor, 'all', 'pre', or 'post'.
     * @param {Message} message - Message to test.
     * @param {Command} [command] - Command to use.
     * @returns {Promise<void[]>}
     */
    test(type, message, command) {
        if (!this.modules.size) return Promise.resolve();

        const inhibitors = this.modules.filter(i => i.type === type && i.enabled);
        if (!inhibitors.size) return Promise.resolve();

        const promises = [];

        for (const inhibitor of inhibitors.values()) {
            const inhibited = inhibitor.exec(message, command);

            if (inhibited instanceof Promise) {
                promises.push(inhibited.catch(err => {
                    if (err instanceof Error) throw err;
                    return Promise.reject(inhibitor.reason);
                }));

                continue;
            }

            if (!inhibited) {
                promises.push(Promise.resolve());
                continue;
            }

            promises.push(Promise.reject(inhibitor.reason));
        }

        return Promise.all(promises);
    }

    /**
     * Deregisters a module.
     * @private
     * @method
     * @name InhibitorHandler#_unapply
     * @param {Inhibitor} inhibitor - Module to use.
     * @returns {void}
     */

    /**
     * Registers a module.
     * @private
     * @method
     * @name InhibitorHandler#_apply
     * @param {Inhibitor} inhibitor - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */

    /**
     * Loads an inhibitor.
     * @method
     * @param {string|Inhibitor} thing - Module or path to module.
     * @name InhibitorHandler#load
     * @returns {Inhibitor}
     */

    /**
     * Reads all inhibitors from the directory and loads them.
     * @method
     * @name InhibitorHandler#loadAll
     * @returns {InhibitorHandler}
     */

    /**
     * Adds an inhibitor.
     * @method
     * @name InhibitorHandler#add
     * @param {string} filename - Filename to lookup in the directory.
     * A .js extension is assumed.
     * @returns {Inhibitor}
     */

    /**
     * Removes an inhibitor.
     * @method
     * @name InhibitorHandler#remove
     * @param {string} id - ID of the inhibitor.
     * @returns {Inhibitor}
     */

    /**
     * Removes all inhibitors.
     * @method
     * @name InhibitorHandler#removeAll
     * @returns {InhibitorHandler}
     */

    /**
     * Reloads an inhibitor.
     * @method
     * @name InhibitorHandler#reload
     * @param {string} id - ID of the inhibitor.
     * @returns {Inhibitor}
     */

    /**
     * Reloads all inhibitors.
     * @method
     * @name InhibitorHandler#reloadAll
     * @returns {InhibitorHandler}
     */
}

module.exports = InhibitorHandler;

/**
 * Emitted when an inhibitor is loaded.
 * @event InhibitorHandler#load
 * @param {Inhibitor} inhibitor - Inhibitor loaded.
 */

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
