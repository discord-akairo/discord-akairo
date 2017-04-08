const { AkairoClient, Constants } = require('../src/index.js');
const JSONHandler = require('./JSONHandler');

const client = new AkairoClient({
    prefix: '.',
    ownerID: '123992700587343872',
    commandDirectory: './test/commands/',
    listenerDirectory: './test/listeners/',
    inhibitorDirectory: './test/inhibitors/',
    handleEdits: true,
    allowMention: true
});

const { Collection } = require('discord.js');
client.mem.edits = new Collection();

client.build();

client.jsonHandler = new JSONHandler(client, {
    directory: './test/jsons/'
}).loadAll();

client.commandHandler.resolver.addType('1-10', function type(word) {
    const num = this[Constants.ArgumentTypes.INTEGER](word);
    if (num == null) return null;
    if (num < 1 || num > 10) return null;
    return num;
});

client.login(require('./auth.json').token).then(() => {
    console.log('Ready!'); // eslint-disable-line no-console
});

process.on('unhandledRejection', err => console.error(err)); // eslint-disable-line no-console
