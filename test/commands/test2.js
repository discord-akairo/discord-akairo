const { Command } = require('../../src/index.js');

module.exports = class TestCommand extends Command {
    constructor() {
        super('test2', {
            aliases: ['test2', 't2'],
            args: [
                {
                    id: 'array',
                    type: ['one', 'two', ['three', 'tree']]
                },
                {
                    id: 'thing',
                    match: 'prefix',
                    prefix: '--thing:',
                    type: word => {
                        console.log(`in: ${word}`);
                        return word || null;
                    }
                }
            ]
        });
    }

    exec(message, args) {
        return console.log(args);
    }
};
