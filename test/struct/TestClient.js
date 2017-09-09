const { AkairoClient, SQLiteProvider } = require('../../src/index');
const sqlite = require('sqlite');

class TestClient extends AkairoClient {
    constructor() {
        super({
            prefix: '!!',
            ownerID: '123992700587343872',
            commandDirectory: './test/commands/',
            handleEdits: true,
            allowMention: true,
            defaultPrompt: {
                start: 'What is thing?',
                modifyStart: (text, msg) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                retry: 'What is thing, again?',
                modifyRetry: (text, msg) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                timeout: 'Out of time.',
                ended: 'No more tries.',
                cancel: 'Cancelled.'
            }
        });

        this.settings = new SQLiteProvider(sqlite.open('./test/db.sqlite')
        .then(db => db.run('CREATE TABLE IF NOT EXISTS guilds (id TEXT NOT NULL UNIQUE, settings TEXT)')
        .then(() => db)
        ), 'guilds', { dataColumn: 'settings' });
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

    async start(token) {
        this.setup();
        await this.settings.init();
        await this.login(token);
        console.log('Ready!'); // eslint-disable-line no-console
    }
}

module.exports = TestClient;
