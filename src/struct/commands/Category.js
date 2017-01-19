const Collection = require('discord.js').Collection;

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
     */
    reloadAll(){
        Array.from(this.values()).forEach(c => c.reload());
    }

    /**
     * Calls remove() on all commands in this category.
     */
    removeAll(){
        Array.from(this.values()).forEach(c => c.remove());
    }

    /**
     * Calls enable() on all commands in this category.
     */
    enableAll(){
        Array.from(this.values()).forEach(c => c.enable());
    }

    /**
     * Calls disable() on all commands in this category.
     */
    disableAll(){
        Array.from(this.values()).forEach(c => c.disable());
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