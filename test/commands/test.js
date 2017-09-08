/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            split: 'sticky',
            args: [
                {
                    id: 'prefix',
                    match: 'prefix',
                    prefix: '-prefix='
                },
                {
                    id: 'flag',
                    match: 'flag',
                    prefix: '-flag'
                },
                {
                    id: 'test'
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args), { code: 'js' });
    }
}

module.exports = TestCommand;
