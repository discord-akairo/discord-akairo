const { Command } = require('../../../src/index.js');

function exec(message) {
    return message.reply('pong!').then(sent => {
        const timeDiff = sent.createdAt - message.createdAt;
        const text = `🔂\u2000**RTT**: ${timeDiff} ms\n💟\u2000**Heartbeat**: ${Math.round(this.client.ping)} ms`;
        return sent.edit(`${sent.content}\n${text}`);
    });
}

module.exports = new Command('ping', exec, {
    aliases: ['ping', 'p'],
    prefix: ['a!'],
    editable: false
});
