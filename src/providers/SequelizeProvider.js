const Provider = require('./Provider');

/** @extends Provider */
class SequelizeProvider extends Provider {
    /**
     * Provider using the `sequelize` library.
     * @param {Model} table - A Sequelize model.
     * @param {string} [dataColumn] - Column for JSON data.
     * If not provided, the provider will use all columns of the table.
     * If provided, only one column will be used, but it will be more flexible due to being parsed as JSON.
     * Note that the model has to specify the type of the column as JSON or JSONB.
     */
    constructor(table, dataColumn) {
        super();

        /**
         * Sequelize model.
         * @type {Model}
         */
        this.table = table;

        /**
         * Column for JSON data.
         * @type {?string}
         */
        this.dataColumn = dataColumn;
    }

    /**
     * Initializes the provider.
     * @returns {Bluebird<void>}
     */
    init() {
        return this.table.findAll().then(rows => {
            for (const row of rows) {
                this.items.set(row.id, this.dataColumn ? row[this.dataColumn] : row);
            }
        });
    }

    /**
     * Gets a value.
     * @param {string} id - ID of entry.
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
     * @param {string} id - ID of entry.
     * @param {string} key - The key to set.
     * @param {any} value - The value.
     * @returns {Bluebird<boolean>}
     */
    set(id, key, value) {
        const data = this.items.get(id) || {};
        data[key] = value;
        this.items.set(id, data);

        if (this.dataColumn) {
            return this.table.upsert({
                id,
                [this.dataColumn]: data
            });
        }

        return this.table.upsert({
            id,
            [key]: value
        });
    }

    /**
     * Deletes a value.
     * @param {string} id - ID of entry.
     * @param {string} key - The key to delete.
     * @returns {Promise<boolean>}
     */
    delete(id, key) {
        const data = this.items.get(id) || {};
        delete data[key];

        if (this.dataColumn) {
            return this.table.upsert({
                id,
                [this.dataColumn]: data
            });
        }

        return this.table.upsert({
            id,
            [key]: null
        });
    }

    /**
     * Clears an entry.
     * @param {string} id - ID of entry.
     * @returns {Bluebird<void>}
     */
    clear(id) {
        this.items.delete(id);
        return this.table.destroy({ where: { id } });
    }
}

module.exports = SequelizeProvider;
