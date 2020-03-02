/* eslint-disable no-console */

import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

const { compose, range, union } = Argument;

export default class Test2Command extends Command {
    public constructor() {
        super('test2', {
            aliases: ['test2'],
            cooldown: 5000,
            prefix: () => ['/', '>'],
            args: [
                {
                    id: 'y',
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
