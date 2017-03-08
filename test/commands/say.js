const { Command } = require('../../src/index.js');

function exec(message, args, edited){
    if (edited && this.client.mem.edits.has(message.id)){
        const reply = this.client.mem.edits.get(message.id);
        return reply.edit(args.content);
    }

    return message.channel.send(args.content).then(sent => {
        this.client.mem.edits.set(message.id, sent);
    });
}

module.exports = new Command('say', exec, {
    aliases: ['say'],
    args: [
        {
            id: 'content',
            match: 'content'
        }
    ]
});
