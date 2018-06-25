/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class ArgsCommand extends Command {
    constructor() {
        super('args', {
            aliases: ['args'],
            args: [
                {
                    id: 'x'
                },
                {
                    id: 'y',
                    match: 'rest'
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = ArgsCommand;
