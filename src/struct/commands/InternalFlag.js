class InternalFlag {
    static cancel() {
        return new CommandCancel();
    }

    static retry(message) {
        return new CommandRetry(message);
    }
}

class CommandCancel extends InternalFlag {}

class CommandRetry extends InternalFlag {
    constructor(message) {
        super();

        this.message = message;
    }
}

Object.assign(InternalFlag, {
    CommandCancel,
    CommandRetry
});

module.exports = InternalFlag;
