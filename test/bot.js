const TestClient = require('./struct/TestClient');
const { token, ownerID } = require('./auth.json');

/*
 * Place an auth.json file in this directory with the following info:
 * { "token": "put your bot token here", "ownerID": "put your snowflake here" }
 */

const client = new TestClient(ownerID);
client.start(token);

process.on('unhandledRejection', err => console.error(err)); // eslint-disable-line no-console
