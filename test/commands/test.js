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
                        start: 'pls input number',
                        retry: 'pls input number (retry)'
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
