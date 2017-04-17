const { Listener } = require('../../src/index.js');

function exec(message, command) {
    process.stdout.write(`Used ${command.id}\n`);
}

module.exports = new Listener('commandStarted', exec, {
    emitter: 'commandHandler',
    eventName: 'commandStarted',
    type: 'on'
});
