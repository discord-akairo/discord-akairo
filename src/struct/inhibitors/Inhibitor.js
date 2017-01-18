class Inhibitor {
    /**
     * Creates a new Inhibitor.
     * @param {string} id - Inhibitor ID.
     * @param {string} reason - Reason emitted when a command/message is blocked.
     * @param {boolean} preMessage - Makes this inhibitor run before the message is handled rather than after.
     * @param {function} exec - Function (<code>(message, command) => {}</code>) called before a command is ran. Return true or a rejecting Promise to block.
     */
    constructor(id, reason, preMessage, exec){
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
         * Inhibitor runs before message is handled.
         * @type {boolean}
         */
        this.preMessage = preMessage;

        /**
         * Function called to inhibit.
         * @type {function}
         */
        this.exec = exec;

        /**
         * Whether or not this inhibitor is enabled.
         * @type {boolean}
         */
        this.enabled = true;

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
         * The inhibitor handler.
         * @readonly
         * @type {InhibitorHandler}
         */
        this.inhibitorHandler = null;
    }

    /**
     * Reloads the inhibitor.
     */
    reload(){
        this.inhibitorHandler.reload(this.id);
    }
    
    /**
     * Removes the Inhibitor. It can be readded with the inhibitor handler.
     */
    remove(){
        this.inhibitorHandler.remove(this.id);
    }

    /**
     * Enables the inhibitor.
     */
    enable(){
        if (this.enabled) return;
        this.enabled = true;
    }

    /**
     * Disables the inhibitor.
     */
    disable(){
        if (!this.enabled) return;
        this.enabled = false;
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