const AkairoError = require('../../util/AkairoError');

class Flag {
    /**
     * A special return value during commmand execution or argument parsing.
     */
    constructor() {
        throw new AkairoError('NOT_INSTANTIABLE', 'Flag');
    }

    /**
     * Creates a flag that cancels the command.
     * @returns {CommandCancel}
     */
    static cancel() {
        return new CancelFlag();
    }

    /**
     * Creates a flag that retries with another input.
     * @param {Message} message - Message to handle.
     * @returns {CommandRetry}
     */
    static retry(message) {
        return new RetryFlag(message);
    }
}

/** @extends Flag */
class CancelFlag extends Flag {
    /**
     * Ends execution prematurely.
     */
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }
}

/** @extends Flag */
class RetryFlag extends Flag {
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

Object.assign(Flag, {
    CancelFlag,
    RetryFlag
});

module.exports = Flag;
