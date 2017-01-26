module.exports = {
    Framework: require('./struct/Framework'),
    Command: require('./struct/commands/Command'),
    Inhibitor: require('./struct/inhibitors/Inhibitor'),
    Listener: require('./struct/listeners/Listener'),
    DatabaseHandler: require('./struct/databases/DatabaseHandler'),
    SQLiteHandler: require('./struct/databases/SQLiteHandler'),
    Constants: require('./struct/utils/Constants'),
    version: require('../package.json').version
};