const TestClient = require('./struct/TestClient');
const client = new TestClient().build();

const { token } = require('./auth.json');
client.start(token);

process.on('unhandledRejection', err => console.error(err)); // eslint-disable-line no-console
