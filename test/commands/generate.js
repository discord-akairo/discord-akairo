/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class GenerateCommand extends Command {
    constructor() {
        super('generate', {
            aliases: ['generate', 'g'],
            flags: ['-f'],
            args: function* args() {
                const x = yield { type: 'integer' };
                const xs = yield {
                    match: 'separate',
                    type: 'integer',
                    prompt: {
                        start: 'Give me some integers!',
                        retry: (msg, { phrase }) => `"${phrase}" is not an integer, try again!`
                    }
                };

                const f = yield {
                    match: 'flag',
                    flag: '-f'
                };

                return { x, xs, f };
            }
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = GenerateCommand;
