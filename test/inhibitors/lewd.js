const { Inhibitor } = require('../../src/index.js');

function exec(message){
    return message.content.includes('lewd');
}

module.exports = new Inhibitor('lewd', exec, {
    reason: 'lewd',
    type: 'post'
});
