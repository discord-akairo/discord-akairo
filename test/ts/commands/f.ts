/* eslint-disable no-console */

import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class FCommand extends Command {
    public constructor() {
        super('f', {
            aliases: ['f'],
            args: [
                {
                    id: 'x',
                    type: (msg, phrase) => {
                        if (phrase.length > 10) {
                            return Flag.fail(phrase);
                        }

                        return phrase;
                    },
                    default: (msg: Message, value: any) => {
                        console.log('failed', value);
                        return 1;
                    }
                }
            ]
        });
    }

    public exec(message: Message, args: any) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
