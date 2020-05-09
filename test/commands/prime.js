/* eslint-disable no-console */

const { Command } = require('../../src');
const { primeNumber } = require('../util/types');
const util = require('util');

class PCommand extends Command {
    constructor() {
        super('prime', {
            aliases: ['prime'],
            args: [
                {
                    id: 'number',
                    type: primeNumber()
                }
            ]
        });
    }

    exec(message, { number }) {
        message.channel.send(util.inspect(number, { depth: 1 }), { code: 'js' });
    }
}

module.exports = PCommand;
