module.exports = {
    ArgumentMatches: {
        PHRASE: 'phrase',
        FLAG: 'flag',
        OPTION: 'option',
        REST: 'rest',
        SEPARATE: 'separate',
        TEXT: 'text',
        CONTENT: 'content',
        REST_CONTENT: 'restContent',
        NONE: 'none'
    },
    AkairoHandlerEvents: {
        LOAD: 'load',
        REMOVE: 'remove'
    },
    CommandHandlerEvents: {
        MESSAGE_BLOCKED: 'messageBlocked',
        MESSAGE_INVALID: 'messageInvalid',
        COMMAND_BLOCKED: 'commandBlocked',
        COMMAND_STARTED: 'commandStarted',
        COMMAND_FINISHED: 'commandFinished',
        COMMAND_CANCELLED: 'commandCancelled',
        COMMAND_LOCKED: 'commandLocked',
        MISSING_PERMISSIONS: 'missingPermissions',
        COOLDOWN: 'cooldown',
        IN_PROMPT: 'inPrompt',
        ERROR: 'error'
    },
    BuiltInReasons: {
        CLIENT: 'client',
        BOT: 'bot',
        OWNER: 'owner',
        GUILD: 'guild',
        DM: 'dm'
    }
};
