const { Command } = require('../..');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            args: [
                {
                    id: 'numbers',
                    match: 'text',
                    limit: 3
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
