/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            split: 'quoted',
            args: [
                {
                    id: 'integer',
                    type: 'integer',
                    prompt: {
                        start: 'Give me an integer!',
                        retry: 'That\'s not an integer, try again!'
                    }
                },
                {
                    id: 'number',
                    type: 'number',
                    prompt: {
                        start: 'Give me a number!',
                        retry: 'That\'s not a number, try again!'
                    }
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
        console.log(message.util.messages.map(m => m.content));
    }
}

module.exports = TestCommand;
