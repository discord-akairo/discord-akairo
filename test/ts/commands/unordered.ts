/* eslint-disable no-console */

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class UnorderedCommand extends Command {
    public constructor() {
        super('unordered', {
            aliases: ['unordered', 'un'],
            args: [
                {
                    id: 'integer1',
                    unordered: true,
                    type: 'integer'
                },
                {
                    id: 'integer2',
                    unordered: true,
                    type: 'integer'
                }
            ]
        });
    }

    public exec(message: Message, args: any) {
        message.channel.send(inspect(args, { depth: 1 }), { code: 'js' });
    }
}
