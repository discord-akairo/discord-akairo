const { Command } = require('../../../src/index.js');

function exec(message) {
    return message.util.send('Pong!').then(sent => {
        const timeDiff = (sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt);
        const text = `🔂\u2000**RTT**: ${timeDiff} ms\n💟\u2000**Heartbeat**: ${Math.round(this.client.ping)} ms`;
        return message.util.send(`Pong!\n${text}`);
    });
}

module.exports = new Command('ping', exec, {
    aliases: ['ping', 'p'],
    prefix: ['!', '']
});
