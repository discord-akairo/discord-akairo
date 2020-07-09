const { Command, Argument, Flag } = require('../..');

class DefaultFlagsCommand extends Command {
    constructor() {
        super('df', {
            aliases: ['df'],
            args: [
                {
                    // This arg is for testing Argument.validate's default flag
                    id: 'n',
                    type: Argument.validate('integer', (m, p, v) => v !== 5),
                    otherwise: (msg, { failure }) => {
                        // if the value is 5, this should return "validateFailed"
                        if (failure) {
                            return failure.value.reason;
                        } else {
                            return 'An error occurred while parsing arg `n`, is it missing?';
                        }
                    },
                },
                {
                    // This arg is for testing Argument.range's default flag
                    id: 'x',
                    type: Argument.range('integer', 1, 4, true),
                    otherwise: (msg, { failure }) => {
                        // If the argument is out of range, this should return 'rangeFailed'
                        return failure.value.reason;
                    }
                },
                {
                    // This arg is for testing Argument.union's handling of flags
                    id: 'u',
                    type: Argument.union( 
                        Argument.validate('lowercase', (message, phrase, value) => value === 'one' || value === 'two'),
                        async (message, phrase) => {
                            const result = await Argument.range('integer', 1, 2, true).call(this, message, phrase);
                            if (Argument.isFailure(result)) return Flag.fail({ reason: 'notOneOrTwo'});
                            return phrase;
                        }
                    ),
                    otherwise: (msg, { failure }) => {
                        // In the case that the value is not either "no" or an integer between 1 and 4 (inclusive),
                        // this should always return "b", as it is the last case that can fail
                        return failure.value.reason;
                    }
                },
                {
                    // This arg is for testing the new 'required' default type's default flag
                    id: 'r',
                    type: 'required',
                    otherwise: (msg, { failure }) => {
                        // If this argument is not provided, this should return 'reequiredFailed'
                        return failure.value.reason;
                    }
                }
            ]
        });
    }

    exec(message) {
        return message.channel.send('success');
    }
}

module.exports = DefaultFlagsCommand;
