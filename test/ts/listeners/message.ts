/* eslint-disable no-console */

import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MessageListener extends Listener {
    public constructor() {
        super('message', {
            emitter: 'client',
            event: 'message',
            category: 'client'
        });
    }

    public exec(msg: Message) {
        console.log(msg.content);
    }
}
