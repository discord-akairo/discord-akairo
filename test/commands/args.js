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
                    match: 'phrase'
                },
                {
                    id: 'rest',
                    match: 'rest'
                },
                {
                    id: 'separate',
                    match: 'separate'
                },
                {
                    id: 'flag',
                    match: 'flag',
                    flag: '-f'
                },
                {
                    id: 'option',
                    match: 'option',
                    flag: '-o'
                }
            ]
        });
    }

    exec(message, args) {
        message.channel.send(util.inspect(args, { depth: 1 }), { code: 'js' });
    }
}

module.exports = ArgsCommand;
