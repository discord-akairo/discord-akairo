/* eslint-disable no-console */

const { Command } = require('../..');
const util = require('util');

class ArgsCommand extends Command {
    constructor() {
        super('args', {
            aliases: ['args'],
            args: [
                {
                    id: 'text',
                    match: 'text'
                },
                {
                    id: 'content',
                    match: 'content'
                },
                {
                    id: 'phrase',
                    match: 'phrase',
                    otherwise: () => 'no!'
                },
                {
                    id: 'rest',
                    match: 'rest'
                },
                {
                    id: 'restContent',
                    match: 'restContent'
                },
                {
                    id: 'separate',
                    match: 'separate'
                },
                {
                    id: 'flag',
                    match: 'flag',
                    flag: ['-f', '--flag']
                },
                {
                    id: 'option',
                    match: 'option',
                    flag: ['-o', '--option']
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = ArgsCommand;
