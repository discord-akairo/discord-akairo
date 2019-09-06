/* eslint-disable no-console */

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class QCommand extends Command {
    public constructor() {
        super('q', {
            aliases: ['q']
        });
    }

    public exec(message: Message) {
        const command = this.handler.modules.get('p');
        return this.handler.handleDirectCommand(message, '', command!);
    }
}
