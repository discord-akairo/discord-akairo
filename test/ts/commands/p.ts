/* eslint-disable no-console */

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class PCommand extends Command {
    public constructor() {
        super('p', {
            aliases: ['p'],
            args: [
                {
                    id: 'integer',
                    type: 'bigint',
                    prompt: {
                        start: async () => {
                            await Promise.resolve(1);
                            return 'Give me an integer!';
                        },
                        retry: 'That\'s not an integer, try again!',
                        optional: false
                    }
                }
            ]
        });
    }

    public before() {
        console.log(1);
    }

    public exec(message: Message, args: any) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
