const { Command } = require('../../src/index.js');

function exec(message, args) {
    return console.log(args);
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'thing',
            type: /ok|notok/,
            prompt: true
        },
        {
            id: 'thing2',
            type: 'message',
            prompt: {
                retries: 1
            }
        },
        {
            id: 'thing3',
            type: (w, m, args) => {
                if (args.thing === 'ok') return (w && parseInt(w) + 5) || null;
                return (w && parseInt(w) - 5) || null;
            },
            prompt: {
                start: 'this changes'
            }
        },
        {
            id: 'aflag',
            match: 'flag',
            prefix: '--flag'
        },
        {
            id: 'aprefix',
            match: 'prefix',
            prefix: '--prefix'
        }
    ],
    defaultPrompt: {
        start: () => 'text from command',
        retries: 5
    }
});
