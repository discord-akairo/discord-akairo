const { Listener } = require('../..');

class InvalidMessageListener extends Listener {
    constructor() {
        super('messageInvalid', {
            emitter: 'commandHandler',
            event: 'messageInvalid',
            category: 'commandHandler'
        });
    }

    exec(msg) {
        console.log(msg.util);
    }
}

module.exports = InvalidMessageListener;
