/* eslint-disable no-console */

import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class InvalidMessageListener extends Listener {
    public constructor() {
        super('messageInvalid', {
            emitter: 'commandHandler',
            event: 'messageInvalid',
            category: 'commandHandler'
        });
    }

    public exec(msg: Message) {
        console.log(msg.util!.parsed);
    }
}
