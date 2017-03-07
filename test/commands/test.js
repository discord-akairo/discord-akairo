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
                    start: () => 'type a number'
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
        }
    ]
});
