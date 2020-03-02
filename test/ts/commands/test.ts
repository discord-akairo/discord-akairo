/* eslint-disable no-console */

import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

const { compose, range, union } = Argument;

export default class TestCommand extends Command {
    public constructor() {
        super('test', {
            aliases: ['test', 'test-a'],
            cooldown: 5000,
            prefix: ['$', '%'],
            args: [
                {
                    id: 'x',
                    match: 'rest',
                    type: compose((m, s) => s.replace(/\s/g, ''), range(union('integer', 'emojint'), 0, 50))
                }
            ]
        });
    }

    public exec(message: Message, args: any) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
