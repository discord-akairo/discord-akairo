/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class SeparateCommand extends Command {
    constructor() {
        super('separate', {
            aliases: ['separate', 'sep'],
            args: [
                {
                    id: 'integers',
                    match: 'separate',
                    type: 'integer',
                    prompt: {
                        start: 'Give me some integers!',
                        retry: (msg, args, { phrase }) => `"${phrase}" is not an integer, try again!`
                    }
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = SeparateCommand;
