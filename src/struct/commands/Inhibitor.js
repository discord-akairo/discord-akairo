class Inhibitor {
    /**
     * Creates a new Inhibitor.
     * @param {string} id - Inhibitor ID.
     * @param {string} reason - Reason emitted when a command is blocked.
     * @param {function} exec - Function called before a command is ran. Return true or a rejecting Promise to block. (message, command)
     */
    constructor(id, reason, exec){
        /**
         * ID of the Inhibitor.
         * @type {string}
         */
        this.id = id;

        /**
         * Reason emitted when command is inhibited.
         * @type {string}
         */
        this.reason = reason;

        /**
         * Function called to inhibit.
         * @type {function}
         */
        this.exec = exec;

        /**
         * Path to Inhibitor file.
         * @readonly
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Akairo framework.
         * @readonly
         * @type {Framework}
         */
        this.framework = null;

        /** 
         * The Discord.js client. 
         * @readonly
         * @type {Client}
         */
        this.client = null;

        /**
         * The command handler.
         * @readonly
         * @type {CommandHandler}
         */
        this.commandHandler = null;
    }

    /**
     * Reloads the inhibitor.
     */
    reload(){
        this.commandHandler.reloadInhibitor(this.id);
    }
    
    /**
     * Removes the Inhibitor. It can be readded with the command handler.
     */
    remove(){
        this.commandHandler.removeInhibitor(this.id);
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString(){
        return this.id;
    }
}

module.exports = Inhibitor;