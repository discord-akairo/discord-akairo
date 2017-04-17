const { Listener } = require('../../src/index.js');

function exec(message, reason) {
    process.stdout.write(`Blocked ${reason}`);
}

module.exports = new Listener('messageBlocked', exec, {
    emitter: 'commandHandler',
    eventName: 'messageBlocked',
    type: 'on'
});
