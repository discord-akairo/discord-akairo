/* eslint-disable no-console */

import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class GenerateCommand extends Command {
    public constructor() {
        super('generate', {
            aliases: ['generate', 'g']
        });
    }

    public *args() {
        const x = yield {
            type: ['1', '2'],
            otherwise: 'Type 1 or 2!'
        };

        if (x === '1') {
            return Flag.continue('sub');
        }

        return { x };
    }

    public exec(message: Message, args: any) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
