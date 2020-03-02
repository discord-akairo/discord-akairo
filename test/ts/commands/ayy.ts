import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class AyyCommand extends Command {
    public constructor() {
        super('ayy', {
            regex: /^ayy+$/i
        });
    }

    public exec(message: Message) {
        return message.reply('lmao');
    }
}

