import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

interface Evaled {
    output?: string;
    errored?: boolean;
    message?: Message;
}

export default class EvalCommand extends Command {
    public constructor() {
        super('eval', {
            aliases: ['eval', 'e'],
            category: 'owner',
            ownerOnly: true,
            quoted: false,
            args: [
                {
                    id: 'code',
                    match: 'content'
                }
            ]
        });
    }

    public async exec(message: Message, { code }: { code: string }) {
        if (!code) return message.util!.reply('No code provided!');

        const evaled: Evaled = {};
        const logs: string[] = [];

        const token = this.client.token!.split('').join('[^]{0,2}');
        const rev = this.client.token!.split('').reverse().join('[^]{0,2}');
        const tokenRegex = new RegExp(`${token}|${rev}`, 'g');
        const cb = '```';

        const print = (...a: object[]) => { // eslint-disable-line no-unused-vars
            const cleaned = a.map((obj: object | string) => {
                if (typeof obj !== 'string') obj = inspect(obj, { depth: 1 });
                return obj.replace(tokenRegex, '[TOKEN]');
            });

            if (!evaled.output) {
                logs.push(...cleaned);
                return;
            }

            evaled.output += evaled.output.endsWith('\n') ? cleaned.join(' ') : `\n${cleaned.join(' ')}`;
            const title = evaled.errored ? '☠\u2000**Error**' : '📤\u2000**Output**';

            if (evaled.output.length + code.length > 1900) evaled.output = 'Output too long.';
            evaled.message!.edit([
                `📥\u2000**Input**${cb}js`,
                code,
                cb,
                `${title}${cb}js`,
                evaled.output,
                cb
            ]);
        };

        try {
            let output = eval(code);
            if (output && typeof output.then === 'function') output = await output;

            if (typeof output !== 'string') output = inspect(output, { depth: 0 });
            output = `${logs.join('\n')}\n${logs.length && output === 'undefined' ? '' : output}`;
            output = output.replace(tokenRegex, '[TOKEN]');

            if (output.length + code.length > 1900) output = 'Output too long.';

            const sent = await message.util!.send([
                `📥\u2000**Input**${cb}js`,
                code,
                cb,
                `📤\u2000**Output**${cb}js`,
                output,
                cb
            ]);

            // TODO: Remove once #74 is merged
            evaled.message = sent as Message;
            evaled.errored = false;
            evaled.output = output;

            return sent;
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
            let error = err;

            error = error.toString();
            error = `${logs.join('\n')}\n${logs.length && error === 'undefined' ? '' : error}`;
            error = error.replace(tokenRegex, '[TOKEN]');

            const sent = await message.util!.send([
                `📥\u2000**Input**${cb}js`,
                code,
                cb,
                `☠\u2000**Error**${cb}js`,
                error,
                cb
            ]);

            // TODO: Remove once #74 is merged
            evaled.message = sent as Message;
            evaled.errored = true;
            evaled.output = error;

            return sent;
        }
    }
}
