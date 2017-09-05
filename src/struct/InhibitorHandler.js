const AkairoHandler = require('./AkairoHandler');
const Inhibitor = require('./Inhibitor');
const { isPromise } = require('../util/Util');

/** @extends AkairoHandler */
class InhibitorHandler extends AkairoHandler {
    /**
     * Loads inhibitors and checks messages.
     * @param {AkairoClient} client - The Akairo client.
     */
    constructor(client) {
        super(client, client.akairoOptions.inhibitorDirectory, Inhibitor);

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
     * Returns the reason if blocked.
     * @param {string} type - Type of inhibitor, 'all', 'pre', or 'post'.
     * @param {Message} message - Message to test.
     * @param {Command} [command] - Command to use.
     * @returns {Promise<string|void>}
     */
    async test(type, message, command) {
        if (!this.modules.size) return Promise.resolve(null);

        const inhibitors = this.modules.filter(i => i.type === type && i.enabled);
        if (!inhibitors.size) return Promise.resolve(null);

        const promises = [];

        for (const inhibitor of inhibitors.values()) {
            promises.push((async () => {
                let inhibited = inhibitor.exec(message, command);
                if (isPromise(inhibited)) inhibited = await inhibited;

                if (inhibited === true) {
                    return inhibitor.reason;
                }

                return null;
            })());
        }

        const reason = (await Promise.all(promises)).find(r => r != null);
        return reason === undefined ? null : reason;
    }

    /**
     * Deregisters a module.
     * @protected
     * @method
     * @name InhibitorHandler#_deregister
     * @param {Inhibitor} inhibitor - Module to use.
     * @returns {void}
     */

    /**
     * Registers a module.
     * @protected
     * @method
     * @name InhibitorHandler#_register
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
     * A .js extension is assumed if one is not given.
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
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when an inhibitor is removed.
 * @event InhibitorHandler#remove
 * @param {Inhibitor} inhibitor - Inhibitor removed.
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
