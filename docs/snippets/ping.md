# Ping Command

```js
const { Command } = require('discord-akairo');

class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping', 'hello']
        });
    }

    exec(message) {
        return message.util.reply('Pong!').then(sent => {
            const timeDiff = (sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt);
            const text = `🔂\u2000**RTT**: ${timeDiff} ms\n💟\u2000**Heartbeat**: ${Math.round(this.client.ping)} ms`;
            return message.util.reply(`Pong!\n${text}`);
        });
    }
}

module.exports = PingCommand;
```
