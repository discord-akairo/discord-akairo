const { Command } = require('../../src/index.js');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test2', {
            aliases: ['t2'],
            split: 'plain',
            category: 'owner',
            args: [
                {
                    id: 'text',
                    match: 'text'
                },
                {
                    id: 'prefix',
                    match: 'prefix',
                    prefix: '--prefix='
                },
                {
                    id: 'prefix2',
                    match: 'prefix',
                    prefix: '--prefix2='
                },
                {
                    id: 'flag',
                    match: 'flag',
                    prefix: '--flag'
                }
            ]
        });
    }

    exec(message, args) {
        return message.util.sendCode('js', util.inspect(args, { depth: Infinity }));
    }
}

module.exports = TestCommand;
