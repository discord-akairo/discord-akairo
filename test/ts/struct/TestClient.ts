import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, SQLiteProvider } from 'discord-akairo';

const sqlite = require('sqlite');

export default class TestClient extends AkairoClient {
    public commandHandler = new CommandHandler(this, {
        directory: './test/commands/',
        ignoreCooldown: ['132266422679240704'],
        aliasReplacement: /-/g,
        prefix: '!!',
        allowMention: true,
        commandUtil: true,
        commandUtilLifetime: 10000,
        commandUtilSweepInterval: 10000,
        storeMessages: true,
        handleEdits: true,
        argumentDefaults: {
            prompt: {
                start: 'What is thing?',
                modifyStart: (msg, text) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                retry: 'What is thing, again?',
                modifyRetry: (msg, text) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                timeout: 'Out of time.',
                ended: 'No more tries.',
                cancel: 'Cancelled.',
                retries: 5
            },
            modifyOtherwise: (msg, text) => `${msg.author}, ${text}`
        }
    });

    public inhibitorHandler = new InhibitorHandler(this, {
        directory: './test/inhibitors/'
    });

    public listenerHandler = new ListenerHandler(this, {
        directory: './test/listeners/'
    });

    public db = sqlite.open('./test/db.sqlite')
        .then((d: any) => d.run('CREATE TABLE IF NOT EXISTS guilds (id TEXT NOT NULL UNIQUE, settings TEXT)').then(() => d));

    public settings = new SQLiteProvider(this.db, 'guilds', { dataColumn: 'settings' });

    public constructor() {
        super({
            ownerID: '81440962496172032'
        });

        this.setup();
    }

    setup() {
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });

        this.commandHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();

        const resolver = this.commandHandler.resolver;
        resolver.addType('1-10', (message, phrase) => {
            const num = resolver.type('integer')(message, phrase);
            if (num == null) return null;
            if (num < 1 || num > 10) return null;
            return num;
        });
    }

    async start(token: string) {
        await this.settings.init();
        await this.login(token);
        console.log('Ready!'); // eslint-disable-line no-console
    }
}
