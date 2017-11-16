/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            split: 'quoted',
            args: [
                {
                    id: 'role',
                    type: 'role',
                    unordered: true
                },
                {
                    id: 'member',
                    type: 'member',
                    unordered: true
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = TestCommand;
