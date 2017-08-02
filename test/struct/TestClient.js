const { AkairoClient, SQLiteProvider } = require('../../src/index');
const sqlite = require('sqlite');

class TestClient extends AkairoClient {
    constructor() {
        super({
            prefix: '!!',
            ownerID: '123992700587343872',
            commandDirectory: './test/commands/',
            handleEdits: true,
            allowMention: true
        });

        this.settings = null;
    }

    setup() {
        const resolver = this.commandHandler.resolver;
        resolver.addType('1-10', word => {
            const num = resolver.type('integer')(word);
            if (num == null) return null;
            if (num < 1 || num > 10) return null;
            return num;
        });
    }

    start(token) {
        this.setup();
        return sqlite.open('./test/db.sqlite')
        .then(db => db.run('CREATE TABLE IF NOT EXISTS guilds (id TEXT NOT NULL UNIQUE, settings TEXT)').then(() => db))
        .then(db => {
            this.settings = new SQLiteProvider(db, 'guilds', 'settings');
            return this.settings.init();
        })
        .then(() => this.login(token))
        .then(() => console.log('Ready!')); // eslint-disable-line no-console
    }
}

module.exports = TestClient;
