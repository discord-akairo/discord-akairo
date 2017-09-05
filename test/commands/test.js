const { Command } = require('../..');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            args: [
                {
                    id: 'numbers',
                    match: 'separate',
                    type: 'number',
                    prompt: {
                        start: 'Input numbers',
                        retry: 'Gotta be a number',
                        infinite: true
                    }
                }
            ]
        });
    }

    exec(message, args) {
        // eslint-disable-next-line no-console
        console.dir(args, { colors: true });
    }
}

module.exports = TestCommand;
