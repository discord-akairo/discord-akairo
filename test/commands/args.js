/* eslint-disable no-console */

const { Command, Control } = require('../..');
const util = require('util');

class ArgsCommand extends Command {
    constructor() {
        super('args', {
            aliases: ['args'],
            split: 'quoted',
            args: [
                {
                    id: 'a',
                    match: 'content',
                    prompt: true
                },
                Control.tap((m, args) => console.log(args))
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = ArgsCommand;
