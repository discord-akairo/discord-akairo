module.exports = {
    // Core
    AkairoClient: require('./struct/AkairoClient'),
    AkairoHandler: require('./struct/AkairoHandler'),
    AkairoModule: require('./struct/AkairoModule'),

    // Commands
    Argument: require('./struct/Argument'),
    ClientUtil: require('./struct/ClientUtil'),
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
    SQLiteProvider: require('./providers/SQLiteProvider'),

    // Utilities
    AkairoError: require('./util/AkairoError'),
    Category: require('./util/Category'),
    Constants: require('./util/Constants'),
    Util: require('./util/Util'),
    version: require('../package.json').version
};
