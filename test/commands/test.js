/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            args: (message, words) => {
                const args = {};
                args.x = parseInt(words[0]);
                args.y = parseInt(words[1]);
                return args;
            }
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args), { code: 'js' });
    }
}

module.exports = TestCommand;
