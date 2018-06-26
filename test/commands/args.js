/* eslint-disable no-console */

const { Command, Control } = require('../..');
const util = require('util');

class ArgsCommand extends Command {
    constructor() {
        super('args', {
            aliases: ['args'],
            args: [
                {
                    id: 'a'
                },
                Control.if((m, args) => args.a === '1', [
                    {
                        id: 'b'
                    }
                ], [
                    {
                        id: 'c'
                    }
                ]),
                {
                    id: 'd'
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = ArgsCommand;
