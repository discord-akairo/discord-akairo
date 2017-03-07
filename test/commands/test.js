const { Command } = require('../../src/index.js');
const util = require('util');

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
                on: {
                    start: () => 'this is from arg'
                },
                retries: 2
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
            id: 'thing5',
            type: 'number',
            prompt: {
                on: {
                    retry: () => 'retry from arg'
                },
                retries: 3
            }
        }
    ],
    defaultPrompts: {
        start: () => 'this is from command'
    }
});
