const { Listener } = require('../../src/index.js');

function exec(message, command) {
    return console.log(command.id);
}

module.exports = new Listener('commandStarted', exec, {
    emitter: 'commandHandler',
    eventName: 'commandStarted',
    type: 'on'
});
