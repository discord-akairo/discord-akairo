const { Collection } = require('discord.js');

/** @extends Collection */
class Category extends Collection {
    /**
     * A group of commands.
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
     * Calls reload() on all commands in this category.
     * @returns {Category}
     */
    reloadAll(){
        Array.from(this.values()).forEach(c => c.reload());
        return this;
    }

    /**
     * Calls remove() on all commands in this category.
     * @returns {Category}
     */
    removeAll(){
        Array.from(this.values()).forEach(c => c.remove());
        return this;
    }

    /**
     * Calls enable() on all commands in this category.
     * @returns {Category}
     */
    enableAll(){
        this.forEach(c => c.enable());
        return this;
    }

    /**
     * Calls disable() on all commands in this category.
     * @returns {Category}
     */
    disableAll(){
        this.forEach(c => c.disable());
        return this;
    }

    /**
     * Gets the first alias of each command.
     * @returns {string[]}
     */
    list(){
        return this.map(c => c.aliases[0]);
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
