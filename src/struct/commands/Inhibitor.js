class Inhibitor {
    /**
     * Creates a new Inhibitor.
     * @param {string} id Inhibitor ID.
     * @param {string} reason Reason emitted when a command is blocked.
     * @param {function} exec Function called before a command is ran. (message, command)
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
         * @type {?string}
         */
        this.filepath;

        /**
         * The Akairo framework.
         * @type {?Framework}
         */
        this.framework;

        /**
         * The command handler.
         * @type {?CommandHandler}
         */
        this.commandHandler;
    }

    /**
     * Shortcut to command handler's reload.
     */
    reload(){
        this.commandHandler.reloadInhibitor(this.id);
    }
}

module.exports = Inhibitor;