import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class EmbedCommand extends Command {
    public constructor() {
        super('embed', {
            aliases: ['embed'],
            args: [
                {
                    id: 'emptyContent',
                    match: 'flag',
                    flag: '-c'
                },
                {
                    id: 'emptyEmbed',
                    match: 'flag',
                    flag: '-e'
                },
                {
                    id: 'phrase',
                    match: 'phrase'
                }
            ]
        });
    }

    public exec(message: Message, args: any) {
        if (args.emptyContent) {
            return message.util!.send(null, { embed: { description: args.phrase } });
        }

        if (args.emptyEmbed) {
            return message.util!.send(args.phrase, { embed: undefined });
        }

        return message.util!.send(args.phrase, { embed: { description: args.phrase } });
    }
}
