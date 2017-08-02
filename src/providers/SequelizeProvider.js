const Provider = require('./Provider');

class SequelizeProvider extends Provider {
    constructor(table, dataColumn) {
        super();

        this.table = table;
        this.dataColumn = dataColumn;
    }

    init() {
        return this.table.findAll().then(rows => {
            for (const row of rows) {
                this.items.set(row.id, this.dataColumn ? row[this.dataColumn] : row);
            }
        });
    }

    get(id, key, defaultValue) {
        if (this.items.has(id)) {
            const value = this.items.get(id)[key];
            return value == null ? defaultValue : value;
        }

        return defaultValue;
    }

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

    clear(id) {
        this.items.delete(id);
        return this.table.destroy({ where: { id } });
    }
}

module.exports = SequelizeProvider;
