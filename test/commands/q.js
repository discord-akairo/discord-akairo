/* eslint-disable no-console */

const { Command } = require('../..');

class QCommand extends Command {
    constructor() {
        super('q', {
            aliases: ['q'],
            args: [
                {
                    id: 'letter',
                    type: 'letter'
                }
            ]
        });
    }

    exec(message, { letter }) {
        console.log(letter);
        const command = this.handler.modules.get('p');
        return this.handler.handleDirectCommand(message, '', command);
    }
}

module.exports = QCommand;
