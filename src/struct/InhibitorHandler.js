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
    }

    /**
     * Collection of inhibitors.
     * @type {Collection.<string, Inhibitor>}
     */
    get inhibitors(){
        return this.modules;
    }

    /**
     * Tests the pre-message inhibitors against the message. Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @returns {Promise.<string>}
     */
    testMessage(message){
        const promises = this.inhibitors.filter(i => i.type === 'pre' && i.enabled).map(inhibitor => {
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
     * Tests the post-message inhibitors against the message and command. Rejects with the reason if blocked.
     * @param {Message} message - Message to test.
     * @param {Command} command - Command to test.
     * @returns {Promise.<string>}
     */
    testCommand(message, command){
        const promises = this.inhibitors.filter(i => i.type === 'post' && i.enabled).map(inhibitor => {
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
}

module.exports = InhibitorHandler;
