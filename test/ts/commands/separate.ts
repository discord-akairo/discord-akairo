/* eslint-disable no-console */

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class SeparateCommand extends Command {
    public constructor() {
        super('separate', {
            aliases: ['separate', 'sep'],
            args: [
                {
                    id: 'integers',
                    match: 'separate',
                    type: 'integer',
                    prompt: {
                        start: 'Give me some integers!',
                        retry: (msg: Message, { phrase }: { phrase: string }) => `"${phrase}" is not an integer, try again!`
                    }
                }
            ]
        });
    }

    public exec(message: Message, args: any) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
