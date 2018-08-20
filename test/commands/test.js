/* eslint-disable no-console */

const { Argument, Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test', 'test-a'],
            cooldown: 5000,
            args: [
                {
                    id: 'x',
                    type: Argument.range(Argument.union('integer', 'emojint'), 0, 10)
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = TestCommand;
