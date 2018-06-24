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
                Control.if((m, args) => args.x[0] === 1, [
                    {
                        id: 'y',
                        match: 'option',
                        flag: 'y:'
                    }
                ], [
                    {
                        id: 'z',
                        match: 'flag',
                        flag: '--z'
                    }
                ])
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = ArgsCommand;
