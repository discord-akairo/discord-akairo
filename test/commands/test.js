/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            args: [
                {
                    id: 'number',
                    type: 'number',
                    prompt: {
                        start: 'Type a number!',
                        retry: 'Please type a valid number.'
                    }
                },
                (msg, { number }) => {
                    if (number > 10) {
                        return 'Nope';
                    }

                    return null;
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args), { code: 'js' });
    }
}

module.exports = TestCommand;
