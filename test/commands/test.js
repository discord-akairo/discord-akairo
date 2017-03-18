const { Command } = require('../../src/index.js');

function exec(message, args){
    return console.log(args);
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'thing',
            type: 'number',
            prompt: {
                start: 'a number pls',
                retry: 'pls'
            }
        },
        {
            id: 'thing2',
            type: 'number',
            prompt: {
                retries: 1
            }
        },
        {
            id: 'thing3',
            type: (w, m, args) => {
                console.log(args);
                if (args.thing === 1) return w && parseInt(w) + 5 || null;
                return w && parseInt(w) - 5 || null;
            },
            prompt: {
                start: 'this changes'
            }
        }
    ],
    defaultPrompt: {
        start: () => 'text from command',
        retries: 5
    }
});
