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
        USERS: 'users',
        MEMBER: 'member',
        MEMBERS: 'members',
        RELEVANT: 'relevant',
        RELEVANTS: 'relevants',
        CHANNEL: 'channel',
        CHANNELS: 'channels',
        TEXT_CHANNEL: 'textChannel',
        TEXT_CHANNELS: 'textChannels',
        VOICE_CHANNEL: 'voiceChannel',
        VOICE_CHANNELS: 'voiceChannels',
        ROLE: 'role',
        ROLES: 'roles',
        EMOJI: 'emoji',
        EMOJIS: 'emojis',
        GUILD: 'guild',
        GUILDS: 'guilds'
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
        RELOAD: 'reload',
        ENABLE: 'enable',
        DISABLE: 'disable'
    },
    CommandHandlerEvents: {
        MESSAGE_BLOCKED: 'messageBlocked',
        MESSAGE_INVALID: 'messageInvalid',
        COMMAND_DISABLED: 'commandDisabled',
        COMMAND_BLOCKED: 'commandBlocked',
        COMMAND_STARTED: 'commandStarted',
        COMMAND_FINISHED: 'commandFinished',
        COMMAND_COOLDOWN: 'commandCooldown',
        ERROR: 'error'
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
