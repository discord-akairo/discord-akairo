module.exports = {
    ArgumentMatches: {
        WORD: 'word',
        PREFIX: 'prefix',
        FLAG: 'flag',
        TEXT: 'text',
        CONTENT: 'content'
    },
    ArgumentTypes: {
        STRING: 'string',
        NUMBER: 'number',
        INTEGER: 'integer',
        DYNAMIC: 'dynamic',
        DYNAMIC_INT: 'dynamicInt'
    },
    ArgumentSplits: {
        PLAIN: 'plain',
        SPLIT: 'split',
        QUOTED: 'quoted',
        STICKY: 'sticky'
    },
    CommandHandlerEvents: {
        ADD: 'add',
        REMOVE: 'remove',
        RELOAD: 'reload',
        MESSAGE_BLOCKED: 'mesageBlocked',
        MESSAGE_INVALID: 'messageInvalid',
        COMMAND_DISABLED: 'commandDisabled',
        COMMAND_BLOCKED: 'commandBlocked',
        COMMAND_STARTED: 'commandStarted',
        COMMAND_FINISHED: 'commandFinished'
    },
    InhibitorHandlerEvents: {
        ADD: 'add',
        REMOVE: 'remove',
        RELOAD: 'reload'
    },
    ListenerHandlerEvents: {
        ADD: 'add',
        REMOVE: 'remove',
        RELOAD: 'reload'
    }
};