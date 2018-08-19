class ParsingFlag {
    /**
     * A special return value for argument parsing.
     */
    // eslint-disable-next-line no-useless-constructor, no-empty-function
    constructor() {}

    /**
     * Creates a flag that cancels the command.
     * @returns {CommandCancel}
     */
    static cancel() {
        return new CommandCancel();
    }

    /**
     * Creates a flag that retries with another input.
     * @param {Message} message - Message to handle.
     * @returns {CommandRetry}
     */
    static retry(message) {
        return new CommandRetry(message);
    }
}

/** @extends ParsingFlag */
class CommandCancel extends ParsingFlag {
    /**
     * Ends parsing prematurely.
     */
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }
}

/** @extends ParsingFlag */
class CommandRetry extends ParsingFlag {
    /**
     * Retries with another input.
     * @param {Message} message - Message to handle.
     */
    constructor(message) {
        super();

        /**
         * Message to handle.
         * @type {Message}
         */
        this.message = message;
    }
}

Object.assign(ParsingFlag, {
    CommandCancel,
    CommandRetry
});

module.exports = ParsingFlag;
