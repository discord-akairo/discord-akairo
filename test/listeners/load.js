const { Listener } = require('../../src/index.js');

module.exports = class LoadListener extends Listener {
    constructor() {
        super('load', {
            emitter: 'commandHandler',
            eventName: 'load',
            type: 'on'
        });
    }

    exec(command) {
        process.stdout.write(`Loaded ${command.id}\n`);
    }
};
