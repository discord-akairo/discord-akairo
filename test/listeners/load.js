const { Listener } = require('../../src/index.js');

function exec(command) {
    console.log(`Loaded ${command.id}`);
}

module.exports = new Listener('load', exec, {
    emitter: 'commandHandler',
    eventName: 'load',
    type: 'on'
});
