const { Command } = require('../../src/index.js');

module.exports = class TestCommand extends Command {
    constructor() {
        super('test2', null, {
            aliases: ['test2', 't2'],
            args: [
                {
                    id: 'array',
                    type: ['one', 'two', ['three', 'tree']]
                }
            ]
        });
    }

    exec(message, args) {
        return console.log(args);
    }
};
