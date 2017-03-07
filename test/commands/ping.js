const { Command } = require('../../src/index.js');

function exec(message){
    console.log(this.handler.cooldowns);
    return message.channel.send('Pong!');
}

module.exports = new Command('ping', exec, {
    aliases: ['ping', 'p'],
    cooldown: 5000,
    ratelimit: 3
});
