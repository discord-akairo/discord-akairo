const { Listener } = require('../../src/index.js');

function exec(message, command, reason) {
    console.log(reason);
}

module.exports = new Listener('commandBlocked', exec, {
    emitter: 'commandHandler',
    eventName: 'commandBlocked',
    type: 'on'
});
