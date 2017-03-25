const { Command } = require('../../src/index.js');

function exec(message, args) {
    return console.dir(args, { depth: 1 });
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'thing',
            type: 'integer',
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
