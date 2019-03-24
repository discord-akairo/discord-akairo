const { Collection } = require('discord.js');

/**
 * A group of modules.
 * @param {string} id - ID of the category.
 * @param {Iterable} [iterable] - Entries to set.
 * @extends {Collection}
 */
class Category extends Collection {
    constructor(id, iterable) {
        super(iterable);

        /**
         * ID of the category.
         * @type {string}
         */
        this.id = id;
    }

    /**
     * Calls `reload()` on all items in this category.
     * @returns {Category}
     */
    reloadAll() {
        for (const m of Array.from(this.values())) {
            if (m.filepath) m.reload();
        }

        return this;
    }

    /**
     * Calls `remove()` on all items in this category.
     * @returns {Category}
     */
    removeAll() {
        for (const m of Array.from(this.values())) {
            if (m.filepath) m.remove();
        }

        return this;
    }

    /**
     * Calls `enable()` on all items in this category.
     * @returns {Category}
     */
    enableAll() {
        for (const m of this.values()) m.enable();
        return this;
    }

    /**
     * Calls `disable()` on all items in this category.
     * @returns {Category}
     */
    disableAll() {
        for (const m of this.values()) m.disable();
        return this;
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString() {
        return this.id;
    }
}

module.exports = Category;
