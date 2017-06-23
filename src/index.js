module.exports = {
    AkairoClient: require('./struct/AkairoClient'),
    AkairoHandler: require('./struct/AkairoHandler'),
    AkairoModule: require('./struct/AkairoModule'),
    Argument: require('./struct/Argument'),
    ClientUtil: require('./struct/ClientUtil'),
    Command: require('./struct/Command'),
    CommandHandler: require('./struct/CommandHandler'),
    CommandUtil: require('./struct/CommandUtil'),
    Inhibitor: require('./struct/Inhibitor'),
    InhibitorHandler: require('./struct/InhibitorHandler'),
    Listener: require('./struct/Listener'),
    ListenerHandler: require('./struct/ListenerHandler'),
    SQLiteHandler: require('./database/sqlite/SQLiteHandler'),
    TypeResolver: require('./struct/TypeResolver'),
    Category: require('./util/Category'),
    Constants: require('./util/Constants'),
    version: require('../package.json').version
};
