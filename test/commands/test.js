const { Command } = require('../../src/index.js');
const util = require('util');

function exec(message, args){
    return console.dir(args, { depth: 1 });
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'user',
            match: 'content',
            type: 'relevant'
        }
    ]
});
