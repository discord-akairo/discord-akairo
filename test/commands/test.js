const { Command } = require('../../src/index.js');

function exec(message, args) {
    return console.log(args, { depth: 1 }); // eslint-disable-line no-console
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'thing',
            type: (word, message, args) => {
                console.dir(args.thing); // eslint-disable-line no-console
                return word || null;
            },
            prompt: {
                infinite: true,
                limit: 5
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
