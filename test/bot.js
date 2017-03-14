const { AkairoClient } = require('../src/index.js');

const client = new AkairoClient({
    prefix: '.',
    ownerID: '123992700587343872',
    commandDirectory: './test/commands/',
    listenerDirectory: './test/listeners/',
    inhibitorDirectory: './test/inhibitors/',
    handleEdits: true
});

const { Collection } = require('discord.js');
client.mem.edits = new Collection();

client.login(require('./auth.json').token).then(() => {
    console.log('Ready!');
});

process.on('unhandledRejection', err => console.error(err));
