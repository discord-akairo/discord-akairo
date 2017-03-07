const { AkairoClient } = require('../src/index.js');

const client = new AkairoClient({
    prefix: '.',
    ownerID: '123992700587343872',
    commandDirectory: './test/commands/',
    inhibitorDirectory: './test/inhibitors/',
    listenerDirectory: './test/listeners/'
});

client.login(require('./auth.json').token).then(() => {
    console.log('Ready!');
});
