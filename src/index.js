module.exports = {
    Framework: require('./struct/Framework'),
    Command: require('./struct/commands/Command'),
    Inhibitor: require('./struct/commands/Inhibitor'),
    Listener: require('./struct/events/Listener'),
    DatabaseHandler: require('./struct/databases/DatabaseHandler'),
    SQLiteHandler: require('./struct/databases/SQLiteHandler')
};