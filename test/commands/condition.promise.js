const { Command } = require('../../src');

class ConditionalPromiseCommand extends Command {
    constructor() {
        super('condition.promise');
    }

    condition(message) {
        return Promise.resolve(message.content === 'make me promise condition');
    }

    exec(message) {
        return message.util.reply('made you promise condition');
    }
}

module.exports = ConditionalPromiseCommand;
