class Flag {
    /**
     * A special return value during commmand execution or argument parsing.
     * @param {string} type - Type of flag.
     * @param {any} [data={}] - Extra data.
     */
    constructor(type, data = {}) {
        this.type = type;
        Object.assign(this, data);
    }

    /**
     * Creates a flag that cancels the command.
     * @returns {Flag}
     */
    static cancel() {
        return new Flag('cancel');
    }

    /**
     * Creates a flag that retries with another input.
     * @param {Message} message - Message to handle.
     * @returns {Flag}
     */
    static retry(message) {
        return new Flag('retry', { message });
    }

    /**
     * Checks if a value is a flag and of some type.
     * @param {any} value - Value to check.
     * @param {string} type - Type of flag.
     * @returns {boolean}
     */
    static is(value, type) {
        return value instanceof Flag && value.type === type;
    }
}

module.exports = Flag;
