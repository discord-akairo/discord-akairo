/**
 * Represents a special return value during commmand execution or argument parsing.
 * @param {string} type - Type of flag.
 * @param {any} [data={}] - Extra data.
 */
class Flag {
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
     * Creates a flag that acts as argument cast failure with extra data.
     * @param {any} value - The extra data for the failure.
     * @returns {Flag}
     */
    static fail(value) {
        return new Flag('fail', { value });
    }

    /**
     * Creates a flag that runs another command with the rest of the arguments.
     * @param {string} command - Command ID.
     * @param {boolean} [ignore=false] - Whether or not to ignore permission checks.
     * @param {string} [rest] - The rest of the arguments.
     * If this is not set, the argument handler will automatically use the rest of the content.
     * @returns {Flag}
     */
    static continue(command, ignore = false, rest = null) {
        return new Flag('continue', { command, ignore, rest });
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
