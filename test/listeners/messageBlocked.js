const { Listener } = require('../../src/index.js');

function exec(message, reason) {
    console.log(reason);
}

module.exports = new Listener('messageBlocked', exec, {
    emitter: 'commandHandler',
    eventName: 'messageBlocked',
    type: 'on'
});
