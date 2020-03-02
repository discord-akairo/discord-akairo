/* eslint-disable no-console */

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class ArgsCommand extends Command {
    public constructor() {
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

    public exec(message: Message, args: object) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
