const { Listener } = require('../../src/index.js');

function exec(message, reason) {
    process.stdout.write(`Blocked ${reason}\n`);
}

module.exports = new Listener('messageBlocked', exec, {
    emitter: 'commandHandler',
    eventName: 'messageBlocked',
    type: 'on'
});
