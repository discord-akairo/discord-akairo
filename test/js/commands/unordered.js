/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class UnorderedCommand extends Command {
    constructor() {
        super('unordered', {
            aliases: ['unordered', 'un'],
            args: [
                {
                    id: 'integer1',
                    unordered: true,
                    type: 'integer'
                },
                {
                    id: 'integer2',
                    unordered: true,
                    type: 'integer'
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = UnorderedCommand;
