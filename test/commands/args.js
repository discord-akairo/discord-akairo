/* eslint-disable no-console */

const { Command, Argument, Control } = require('../..');
const util = require('util');

class ArgsCommand extends Command {
    constructor() {
        super('args', {
            aliases: ['args'],
            args: [
                {
                    id: 'x',
                    type: Argument.every('integer', 'string')
                },
                Control.if(() => true, {
                    id: 'y'
                }, {
                    id: 'z'
                })
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = ArgsCommand;
