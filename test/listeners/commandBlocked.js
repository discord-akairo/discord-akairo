const { Listener } = require('../../src/index.js');

function exec(message, command, reason) {
    console.log(`Blocked ${command.id}: ${reason}`); // eslint-disable-line no-console
}

module.exports = new Listener('commandBlocked', exec, {
    emitter: 'commandHandler',
    eventName: 'commandBlocked',
    type: 'on'
});
