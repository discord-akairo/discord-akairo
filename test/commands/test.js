const { Command } = require('../../src/index.js');
const util = require('util');

function exec(message, args) {
    return process.stdout.write(`${util.inspect(args, { depth: 1 })}\n`);
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'thing',
            type: (word, message, args) => {
                process.stdout.write(`${util.inspect(args.thing)}\n`);
                return word || null;
            },
            prompt: {
                infinite: true,
                retries: 2
            }
        },
        {
            id: 'aflag',
            match: 'flag',
            prefix: '--flag'
        },
        {
            id: 'aPrefix',
            match: 'prefix',
            prefix: '--prefix='
        }
    ]
});
