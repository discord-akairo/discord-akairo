/* eslint-disable no-console */

const { Command, Flag } = require('../..');
const util = require('util');

class GenerateCommand extends Command {
    constructor() {
        super('generate', {
            aliases: ['generate', 'g']
        });
    }

    *args() {
        const x = yield {
            type: ['1', '2'],
            otherwise: 'Type 1 or 2!'
        };

        if (x === '1') {
            return Flag.continue('sub');
        }

        return { x };
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = GenerateCommand;
