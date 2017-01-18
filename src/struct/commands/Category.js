const Collection = require('discord.js').Collection;

class Category {
    /**
     * A group of commands.
     * @param {string} id - ID of the category.
     */
    constructor(id){
        /**
         * ID of the category.
         * @type {string} 
         */
        this.id = id;

        /**
         * Collection of commands, mapped by ID to Command.
         * @type {Collection.<string, Command>}
         */
        this.commands = new Collection();
    }

    /**
     * Reloads all commands in this category.
     */
    reloadAll(){
        Array.from(this.commands.values()).forEach(command => command.reload());
    }

    /**
     * Removes all commands in this category.
     */
    removeAll(){
        Array.from(this.commands.values()).forEach(command => command.remove());
    }

    /**
     * Gets the first alias of each command.
     * @return {string[]}
     */
    list(){
        return this.commands.map(command => command.aliases[0]);
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