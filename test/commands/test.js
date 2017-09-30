/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            split: 'quoted',
            args: [
                { id: 'word', match: 'word' },
                { id: 'rest', match: 'rest' },
                { id: 'content', match: 'content' },
                { id: 'text', match: 'text' },
                { id: 'prefix', match: 'prefix', prefix: '-p:' },
                { id: 'flag', match: 'flag', prefix: '-f' }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args), { code: 'js' });
    }
}

module.exports = TestCommand;
