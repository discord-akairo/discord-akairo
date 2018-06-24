const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');
const Argument = require('./arguments/Argument');
const { ArgumentMatches, ArgumentSplits, Symbols } = require('../../util/Constants');
const { Control } = require('./arguments/Control');
const Parser = require('./arguments/Parser');

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string[]} [aliases=[]] - Command names.
 * @prop {Array<Argument|Control>|ArgumentFunction} [args=[]] - Arguments to parse.
 * When an item is an array of arguments, the first argument that is allowed to run will be ran.
 * @prop {ArgumentSplit|ArgumentSplitFunction} [split='plain'] - Method to split text into words.
 * @prop {string} [channel] - Restricts channel to either 'guild' or 'dm'.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 * @prop {boolean} [ownerOnly=false] - Whether or not to allow client owner(s) only.
 * @prop {boolean} [typing=false] - Whether or not to type in channel during execution.
 * @prop {boolean} [editable=true] - Whether or not message edits will run this command.
 * @prop {number} [cooldown] - The command cooldown in milliseconds.
 * @prop {number} [ratelimit=1] - Amount of command uses allowed until cooldown.
 * @prop {string|string[]|PrefixFunction} [prefix] - The prefix(es) to overwrite the global one for this command.
 * @prop {PermissionResolvable|PermissionResolvable[]|PermissionFunction} [userPermissions] - Permissions required by the user to run this command.
 * @prop {PermissionResolvable|PermissionResolvable[]|PermissionFunction} [clientPermissions] - Permissions required by the client to run this command.
 * @prop {RegExp|TriggerFunction} [trigger] - A regex to match in messages that are NOT commands.
 * The args object will have `match` and `matches` properties.
 * @prop {ConditionFunction} [condition] - Whether or not to run on messages that are NOT commands.
 * @prop {ArgumentPromptOptions} [defaultPrompt={}] - The default prompt options.
 * @prop {string|string[]} [description=''] - Description of the command.
 */

/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @typedef {Function} PermissionFunction
 * @param {Message} message - Message that triggered the command.
 * @returns {any}
 */

/**
 * A function used to return a regular expression.
 * @typedef {Function} TriggerFunction
 * @param {Message} message - Message to get regex for.
 * @returns {RegExp}
 */

/**
 * A function used to check if the command should run arbitrarily.
 * @typedef {Function} ConditionFunction
 * @param {Message} message - Message to check.
 * @returns {boolean}
 */

/**
 * A function to replace Akairo's argument handler.
 * @typedef {Function} ArgumentFunction
 * @param {Message} message - Message that triggered the command.
 * @param {string} content - The content of the message.
 * @param {string[]} words - Words matched.
 * @returns {any}
 */

/**
 * The method to split text into words.
 * - `plain` splits word separated by whitespace.
 * Extra whitespace between words are ignored.
 * - `quoted` is similar to plain, but counts text inside double quotes as one word.
 * - `sticky` is similar to quoted, but makes it so that quoted text must have a whitespace or another double quote before it.
 * This means that `thing="hello world"` would be one, rather than two like when using `quoted`.
 * - `none` gives the entire content.
 *
 * A regex or a character can be used instead (for example, a comma) to split the message by that regex or character.
 * @typedef {string|RegExp} ArgumentSplit
 */

/**
 * A function that returns the words to use for the arguments.
 * The returned array can have an `isQuoted` boolean property to indicate that words may be in double quotes.
 * @typedef {Function} ArgumentSplitFunction
 * @param {string} content - The message content without the prefix and command.
 * @param {Message} message - Message that triggered the command.
 * @returns {string[]}
 */

/** @extends AkairoModule */
class Command extends AkairoModule {
    /**
     * Creates a new command.
     * @param {string} id - Command ID.
     * @param {CommandOptions} [options={}] - Options for the command.
     */
    constructor(id, options = {}) {
        super(id, options);

        const {
            aliases = [],
            args = this.args,
            split = this.split || ArgumentSplits.PLAIN,
            channel = null,
            ownerOnly = false,
            editable = true,
            typing = false,
            cooldown = null,
            ratelimit = 1,
            defaultPrompt = {},
            description = '',
            prefix = this.prefix,
            clientPermissions = this.clientPermissions,
            userPermissions = this.userPermissions,
            trigger = this.trigger,
            condition = this.condition || (() => false)
        } = options;

        /**
         * Command names.
         * @type {string[]}
         */
        this.aliases = aliases;

        /**
         * Arguments for the command.
         * @type {Array<ArgumentNode>|ArgumentFunction}
         */
        this.args = typeof args === 'function' ? args.bind(this) : this.buildArgs(args);

        /**
         * The command split method.
         * @type {ArgumentSplit|ArgumentSplitFunction}
         */
        this.split = typeof split === 'function' ? split.bind(this) : split;

        /**
         * Usable only in this channel type.
         * @type {?string}
         */
        this.channel = channel;

        /**
         * Usable only by the client owner.
         * @type {boolean}
         */
        this.ownerOnly = Boolean(ownerOnly);

        /**
         * Whether or not this command can be ran by an edit.
         * @type {boolean}
         */
        this.editable = Boolean(editable);

        /**
         * Whether or not to type during command execution.
         * @type {boolean}
         */
        this.typing = Boolean(typing);

        /**
         * Cooldown in milliseconds.
         * @type {?number}
         */
        this.cooldown = cooldown;

        /**
         * Uses allowed before cooldown.
         * @type {number}
         */
        this.ratelimit = ratelimit;

        /**
         * Default prompt options.
         * @type {ArgumentPromptOptions}
         */
        this.defaultPrompt = defaultPrompt;

        /**
         * Description of the command.
         * @type {string}
         */
        this.description = Array.isArray(description) ? description.join('\n') : description;

        /**
         * Command prefix overwrite.
         * @type {?string|string[]|PrefixFunction}
         */
        this.prefix = typeof prefix === 'function' ? prefix.bind(this) : prefix;

        /**
         * Permissions required to run command by the client.
         * @type {PermissionResolvable|PermissionResolvable[]|PermissionFunction}
         */
        this.clientPermissions = typeof clientPermissions === 'function' ? clientPermissions.bind(this) : clientPermissions;

        /**
         * Permissions required to run command by the user.
         * @type {PermissionResolvable|PermissionResolvable[]|PermissionFunction}
         */
        this.userPermissions = typeof userPermissions === 'function' ? userPermissions.bind(this) : userPermissions;

        /**
         * The regex trigger for this command.
         * @type {RegExp|TriggerFunction}
         */
        this.trigger = typeof trigger === 'function' ? trigger.bind(this) : trigger;

        /**
         * Checks if the command should be ran by using an arbitrary condition.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {boolean}
         */
        this.condition = condition.bind(this);

        /**
         * The ID of this command.
         * @name Command#id
         * @type {string}
         */

        /**
         * The command handler.
         * @name Command#handler
         * @type {CommandHandler}
         */
    }

    /**
     * Executes the command.
     * @abstract
     * @param {Message} message - Message that triggered the command.
     * @param {Object} args - Evaluated arguments.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Parses text based on this command's args.
     * @param {string} content - String to parse.
     * @param {Message} [message] - Message to use.
     * @returns {Promise<Object>}
     */
    parse(content, message) {
        if (!this.args.length && typeof this.args !== 'function') {
            return Promise.resolve({});
        }

        const prefixes = this.getPrefixes();
        const argumentParts = new Parser({
            flagWords: prefixes.flagWords,
            prefixFlagWords: prefixes.prefixFlagWords,
            quotes: this.split === ArgumentSplits.QUOTED ? ['"'] : [],
            content
        }).parse();

        if (typeof this.args === 'function') {
            const res = this.args(message, content, argumentParts);
            return Promise.resolve(res);
        }

        const usedIndices = new Set();
        const parseFuncs = {
            [ArgumentMatches.WORD]: (arg, index) => {
                if (arg.unordered || arg.unordered === 0) {
                    return async (msg, processed) => {
                        const indices = typeof arg.unordered === 'number'
                            ? Array.from(argumentParts.phrases.keys()).slice(arg.unordered)
                            : Array.isArray(arg.unordered)
                                ? arg.unordered
                                : Array.from(argumentParts.phrases.keys());

                        for (const i of indices) {
                            const phrase = argumentParts.phraseAt(i);
                            // eslint-disable-next-line no-await-in-loop
                            const res = await arg.cast(phrase, msg, processed);
                            if (res != null) {
                                usedIndices.add(i);
                                return res;
                            }
                        }

                        return arg.process('', msg, processed);
                    };
                }

                index = arg.index != null ? arg.index : index;
                return arg.process.bind(arg, argumentParts.phraseAt(index));
            },
            [ArgumentMatches.REST]: (arg, index) => {
                index = arg.index != null ? arg.index : index;
                const rest = argumentParts.phrases.slice(index, index + arg.limit).map(ph => ph.value).join('');
                return arg.process.bind(arg, rest);
            },
            [ArgumentMatches.SEPARATE]: (arg, index) => {
                index = arg.index != null ? arg.index : index;
                const phrases = argumentParts.phrases.slice(index, index + arg.limit);

                if (!phrases.length) return arg.process.bind(arg, '');
                return async (msg, processed) => {
                    const res = [];
                    processed[arg.id] = res;

                    for (const phrase of phrases) {
                        // eslint-disable-next-line no-await-in-loop
                        res.push(await arg.process(phrase.value, msg, processed));
                    }

                    return res;
                };
            },
            [ArgumentMatches.PREFIX]: arg => {
                const flag = argumentParts.prefixFlagWith(Array.isArray(arg.prefix) ? arg.prefix : [arg.prefix]);
                return arg.process.bind(arg, flag.value);
            },
            [ArgumentMatches.FLAG]: arg => {
                const flagFound = argumentParts.flagWith(Array.isArray(arg.prefix) ? arg.prefix : [arg.prefix]) != null;
                return () => arg.default == null ? flagFound : !flagFound;
            },
            [ArgumentMatches.TEXT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const word = argumentParts.phrases.slice(index, index + arg.limit).map(ph => ph.value).join('');
                return arg.process.bind(arg, word);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const word = argumentParts.content.slice(index, index + arg.limit).join('').trim();
                return arg.process.bind(arg, word);
            },
            [ArgumentMatches.NONE]: arg => {
                return arg.process.bind(arg, '');
            }
        };

        const processed = {};
        let phraseIndex = 0;

        const process = async args => {
            if (!args.length) return processed;
            const arg = args[0];
            if (arg instanceof Control) {
                return arg.control({
                    process,
                    currentArgs: args,
                    command: this,
                    message,
                    processedArgs: processed
                });
            }

            const matchType = typeof arg.match === 'function' ? arg.match(message, processed) : arg.match;
            const processFunc = parseFuncs[matchType](arg, phraseIndex);

            if ([ArgumentMatches.WORD, ArgumentMatches.REST, ArgumentMatches.SEPARATE].includes(matchType)) {
                phraseIndex++;
            }

            const res = await processFunc(message, processed);
            if (res === Symbols.COMMAND_CANCELLED) return res;
            processed[arg.id] = res;
            return process(args.slice(1));
        };

        return process(this.args);
    }

    /**
     * Builds arguments from options.
     * @param {Array<ArgumentOptions|Control>|ArgumentOptions|Control} args - Argument options to build.
     * @returns {Array<Argument|Control>}
     */
    buildArgs(args) {
        if (!Array.isArray(args)) return this.buildArgs([args]);
        if (args == null) return [];

        const res = [];
        for (const arg of args) {
            if (arg instanceof Control) {
                res.push(arg);
                continue;
            }

            res.push(new Argument(this, arg));
        }

        return res;
    }

    /**
     * Gets the prefixes that are used in all args.
     * @returns {Object}
     */
    getPrefixes() {
        const res = {
            flagWords: [],
            prefixFlagWords: []
        };

        const pushPrefix = arg => {
            const arr = arg.match === ArgumentMatches.FLAG ? 'flagWords' : 'prefixFlagWords';
            if (arg.match === ArgumentMatches.PREFIX || arg.match === ArgumentMatches.FLAG) {
                if (Array.isArray(arg.prefix)) {
                    for (const p of arg.prefix) {
                        arr.push(p);
                    }
                } else {
                    arr.push(arg.prefix);
                }
            }
        };

        for (const arg of this.args) {
            if (Array.isArray(arg)) {
                for (const a of arg) {
                    pushPrefix(a);
                }
            } else {
                pushPrefix(arg);
            }
        }

        return res;
    }

    /**
     * Reloads the command.
     * @method
     * @name Command#reload
     * @returns {Command}
     */

    /**
     * Removes the command.
     * @method
     * @name Command#remove
     * @returns {Command}
     */
}

module.exports = Command;
