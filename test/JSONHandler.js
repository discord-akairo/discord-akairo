const { AkairoHandler } = require('../src/index.js');

class JSONHandler extends AkairoHandler {
    constructor(client, options) {
        super(client, options.directory, Object);
    }
}

module.exports = JSONHandler;
