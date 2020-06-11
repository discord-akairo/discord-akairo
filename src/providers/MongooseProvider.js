const { Provider } = require('discord-akairo');

/**
 * Provider using the `Mongoose` library.
 * @param {Model} model - A Mongoose model.
 * @extends {Provider}
 */
class MongooseProvider extends Provider {
    constructor(model) {
        super();

        /**
         * Mongoose model.
         * @type {Model}
         */
        this.model = model;
    }

    /**
     * Initializes the provider.
     * @returns {<void>}
     */
    async init() {
        const guilds = await this.model.find();
        for (const i in guilds) {
            const guild = guilds[i];
            this.items.set(guild.id, guild.settings);
        }
    }

    /**
     * Gets a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to get.
     * @param {any} [defaultValue] - Default value if not found or null.
     * @returns {any}
     */
    get(id, key, defaultValue) {
        if (this.items.has(id)) {
            const value = this.items.get(id)[key];
            return value == null ? defaultValue : value;
        }

        return defaultValue;
    }

    /**
     * Sets a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to set.
     * @param {any} value - The value.
     * @returns {Promise} - Mongoose query object|document
     */
    async set(id, key, value) {
        const data = this.items.get(id) || {};
        data[key] = value;
        this.items.set(id, data);

        const doc = await this.getDocument(id);
        doc.settings[key] = value;
        doc.markModified('settings');
        return await doc.save();
    }

    /**
     * Deletes a value.
     * @param {string} id - guildID.
     * @param {string} key - The key to delete.
     * @returns {Promise} - Mongoose query object|document
     */
    async delete(id, key) {
        const data = this.items.get(id) || {};
        delete data[key];

        const doc = await this.getDocument(id);
        delete doc.settings[key];
        doc.markModified('settings');
        return await doc.save();
    }

    /**
     * Removes a document.
     * @param {string} id - GuildID.
     * @returns {Promise<void>}
     */
    async clear(id) {
        this.items.delete(id);
        const doc = await this.getDocument(id);
        if (doc) await doc.remove();
    }

    /**
     * Gets a document by guildID.
     * @param {string} id - guildID.
     * @returns {Promise} - Mongoose query object|document
     */
    async getDocument(id) {
        const obj = await this.model.findOne({ id });
        if (!obj) {
            const newDoc = await new this.model({ id, settings: {} }).save();
            return newDoc;
        }
        return obj;
    }
}

module.exports = MongooseProvider;
