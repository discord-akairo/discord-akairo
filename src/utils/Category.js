const { Collection } = require('discord.js');

/** @extends Collection */
class Category extends Collection {
    /**
     * A group of modules.
     * @param {string} id - ID of the category.
     */
    constructor(id){
        super();

        /**
         * ID of the category.
         * @type {string}
         */
        this.id = id;
    }

    /**
     * Calls reload() on all items in this category.
     * @returns {Category}
     */
    reloadAll(){
        Array.from(this.values()).forEach(c => c.reload());
        return this;
    }

    /**
     * Calls remove() on all items in this category.
     * @returns {Category}
     */
    removeAll(){
        Array.from(this.values()).forEach(c => c.remove());
        return this;
    }

    /**
     * Calls enable() on all items in this category.
     * @returns {Category}
     */
    enableAll(){
        this.forEach(c => c.enable());
        return this;
    }

    /**
     * Calls disable() on all items in this category.
     * @returns {Category}
     */
    disableAll(){
        this.forEach(c => c.disable());
        return this;
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString(){
        return this.id;
    }
}

module.exports = Category;
