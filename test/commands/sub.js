/* eslint-disable no-console */

const { Command } = require('../../src');
const util = require('util');

class SubCommand extends Command {
    constructor() {
        super('sub', {
            args: [
                {
                    id: 'thing'
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = SubCommand;
