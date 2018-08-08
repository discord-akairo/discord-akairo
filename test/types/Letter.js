const { Type } = require('../..');
module.exports = Type.create('letter', phrase => phrase.match(/^[A-Z]$/i));
