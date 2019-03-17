/* eslint-disable no-console */

const { Argument: { compose, range, union }, Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test', 'test-a'],
            cooldown: 5000,
            prefix: ['$', '%'],
            args: [
                {
                    id: 'x',
                    match: 'rest',
                    type: compose((m, s) => s.replace(/\s/g, ''), range(union('integer', 'emojint'), 0, 50))
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = TestCommand;
