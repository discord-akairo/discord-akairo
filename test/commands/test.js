const { Command } = require('../../src/index.js');
const util = require('util');

function exec(message, args){
    return message.channel.send(util.inspect(args, { depth: Infinity }));
}

module.exports = new Command('test', exec, {
    aliases: ['test', 't'],
    args: [
        {
            id: 'member',
            type: 'member'
        }
    ]
});
