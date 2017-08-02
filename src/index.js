module.exports = {
    // Core
    AkairoClient: require('./struct/AkairoClient'),
    AkairoHandler: require('./struct/AkairoHandler'),
    AkairoModule: require('./struct/AkairoModule'),

    // Commands
    Argument: require('./struct/Argument'),
    Command: require('./struct/Command'),
    CommandHandler: require('./struct/CommandHandler'),
    CommandUtil: require('./struct/CommandUtil'),
    TypeResolver: require('./struct/TypeResolver'),

    // Inhibitors
    Inhibitor: require('./struct/Inhibitor'),
    InhibitorHandler: require('./struct/InhibitorHandler'),

    // Listeners
    Listener: require('./struct/Listener'),
    ListenerHandler: require('./struct/ListenerHandler'),

    // Providers
    Provider: require('./providers/Provider'),
    SequelizeProvider: require('./providers/SequelizeProvider'),
    SQLiteHandler: require('./struct/SQLiteHandler'),
    SQLiteProvider: require('./providers/SQLiteProvider'),

    // Utilities
    Category: require('./util/Category'),
    ClientUtil: require('./struct/ClientUtil'),
    Constants: require('./util/Constants'),
    version: require('../package.json').version
};
