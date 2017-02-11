module.exports = {
    ArgumentMatches: {
        WORD: 'word',
        PREFIX: 'prefix',
        FLAG: 'flag',
        TEXT: 'text',
        CONTENT: 'content',
        REST: 'rest'
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
        ROLE: 'role',
        EMOJI: 'emoji'
    },
    ArgumentSplits: {
        PLAIN: 'plain',
        SPLIT: 'split',
        QUOTED: 'quoted',
        STICKY: 'sticky'
    },
    AkairoHandlerEvents: {
        ADD: 'add',
        REMOVE: 'remove',
        RELOAD: 'reload'
    },
    CommandHandlerEvents: {
        MESSAGE_BLOCKED: 'messageBlocked',
        MESSAGE_INVALID: 'messageInvalid',
        COMMAND_DISABLED: 'commandDisabled',
        COMMAND_BLOCKED: 'commandBlocked',
        COMMAND_STARTED: 'commandStarted',
        COMMAND_FINISHED: 'commandFinished'
    },
    InhibitorHandlerEvents: {},
    ListenerHandlerEvents: {},
    SQLiteHandlerEvents: {
        INIT: 'init',
        ADD: 'add',
        REMOVE: 'remove',
        SET: 'set',
        SAVE: 'save',
        SAVE_ALL: 'saveAll'
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
