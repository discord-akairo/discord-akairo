const { Command } = require('../../../src/index.js');

function exec(message) {
    return message.reply('aaa');
}

module.exports = new Command('stuff', exec, {
    trigger: /lewd/,
    condition: m => m.content.includes('abc')
});
