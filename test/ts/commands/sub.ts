/* eslint-disable no-console */

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class SubCommand extends Command {
    public constructor() {
        super('sub', {
            args: [
                {
                    id: 'thing'
                }
            ]
        });
    }

    public exec(message: Message, args: any) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
