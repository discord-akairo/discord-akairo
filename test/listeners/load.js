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
        console.log(`Loaded ${command.id}`); // eslint-disable-line no-console
    }
};
