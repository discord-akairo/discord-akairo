const { Command } = require('../..');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            args: [
                {
                    id: 'option',
                    type: ['number', 'channel']
                },
                [
                    {
                        id: 'number',
                        type: 'number',
                        allow: (m, { option }) => option === 'number'
                    },
                    {
                        id: 'channel',
                        type: 'channel',
                        allow: (m, { option }) => option === 'channel'
                    }
                ]
            ]
        });
    }

    exec(message, args) {
        // eslint-disable-next-line no-console
        console.dir(args, { colors: true });
    }
}

module.exports = TestCommand;
