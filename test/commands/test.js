/* eslint-disable no-console */

const { Command } = require('../..');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            args: [
                {
                    id: 'numbers',
                    match: 'separate',
                    type: (word, message, args) => {
                        console.log('type:');
                        console.log(word);
                        console.dir(args, { colors: true });
                        return this.handler.resolver.type('number')(word);
                    },
                    prompt: {
                        start: (message, args, data) => {
                            console.log('start:');
                            console.dir(args, { colors: true });
                            console.dir(data, { depth: 1, colors: true });
                            return 'Input numbers';
                        },
                        retry: (message, args, data) => {
                            console.log('retry:');
                            console.dir(args, { colors: true });
                            console.dir(data, { depth: 1, colors: true });
                            return 'Gotta be a number';
                        },
                        infinite: true
                    }
                }
            ]
        });
    }

    exec(message, args) {
        console.log('end:');
        console.dir(args, { colors: true });
    }
}

module.exports = TestCommand;
