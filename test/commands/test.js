const { Command } = require('../../src/index.js');

function exec(message, args) {
    return console.dir(args, { depth: 0 });
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'thing',
            type: /ok|notok/,
            prompt: {
                retry: function retry() {
                    console.log(this.constructor.name);
                    return 'ok?';
                }
            }
        },
        {
            id: 'thing2',
            match: function match() {
                console.log(this.constructor.name);
                return 'word';
            },
            type: 'message',
            prompt: {
                retries: 1
            }
        },
        {
            id: 'thing3',
            type: function type(w, m, args) {
                console.log(this.constructor.name);
                if (args.thing === 'ok') return (w && parseInt(w) + 5) || null;
                return (w && parseInt(w) - 5) || null;
            },
            prompt: {
                start: () => ({ content: 'aaa', embed: { description: 'hi' } })
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
