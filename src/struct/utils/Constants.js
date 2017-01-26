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
        DYNAMIC_INT: 'dynamicInt',
        USER: 'user',
        MEMBER: 'member',
        CHANNEL: 'channel',
        TEXT_CHANNEL: 'textChannel',
        VOICE_CHANNEL: 'voiceChannel',
        ROLE: 'role'
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
    },
    BuiltInReasons: {
        NOT_SELF: 'notSelf',
        CLIENT: 'client',
        BOT: 'bot',
        OWNER: 'owner',
        GUILD: 'guild',
        DM: 'dm'
    }
};