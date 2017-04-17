const { Listener } = require('../../src/index.js');

function exec(message, reason) {
    console.log(`Blocked ${reason}`); // eslint-disable-line no-console
}

module.exports = new Listener('messageBlocked', exec, {
    emitter: 'commandHandler',
    eventName: 'messageBlocked',
    type: 'on'
});
