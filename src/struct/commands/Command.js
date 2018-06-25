const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');
const Argument = require('./arguments/Argument');
const { ArgumentMatches, Symbols } = require('../../util/Constants');
const { Control } = require('./arguments/Control');
const Parser = require('./arguments/Parser');

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string[]} [aliases=[]] - Command names.
 * @prop {Array<Argument|Control>|Argument|Control|ArgumentFunction} [args=[]] - Arguments to parse.
 * @prop {Object} [parser=Parser] - A custom parser.
 * Note that this must have the same interface as the built-in parser.
 * @prop {boolean} [quoted=true] - Whether or not to consider quotes.
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
 * @prop {RegExp|RegexFunction} [regex] - A regex to match in messages that are not directly commands.
 * The args object will have `match` and `matches` properties.
 * @prop {ConditionFunction} [condition] - Whether or not to run on messages that are not directly commands.
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
 * @typedef {Function} RegexFunction
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
 * @returns {any}
 */

/** @extends AkairoModule */
class Command extends AkairoModule {
    /**
     * Creates a new command.
     * @param {string} id - Command ID.
     * @param {CommandOptions} [options={}] - Options for the command.
     */
    constructor(id, options = {}) {
        super(id, { category: options.category });

        const {
            aliases = [],
            args = this.args || [],
            parser = Parser,
            quoted = true,
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
            regex = this.regex,
            condition = this.condition || (() => false)
        } = options;

        /**
         * Command names.
         * @type {string[]}
         */
        this.aliases = aliases;

        /**
         * Arguments for the command.
         * @type {Array<Argument|Control>|Argument|Control|ArgumentFunction}
         */
        this.args = typeof args === 'function' ? args.bind(this) : args;

        /**
         * The parser to use.
         * @type {Object}
         */
        this.parser = parser;

        /**
         * Whether or not to consider quotes.
         * @type {boolean}
         */
        this.quoted = Boolean(quoted);

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
        this.regex = typeof trigger === 'function' ? regex.bind(this) : regex;

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

        if (typeof this.args === 'function') {
            const res = this.args(message, content);
            return Promise.resolve(res);
        }

        const flags = this.getFlags();
        // eslint-disable-next-line new-cap
        const argumentParts = new this.parser({
            flagWords: flags.flagWords,
            optionFlagWords: flags.optionFlagWords,
            quoted: this.quoted,
            content
        }).parse();

        const usedIndices = new Set();
        const parseFuncs = {
            [ArgumentMatches.PHRASE]: (arg, index) => {
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

                index = arg.index == null ? index : arg.index;
                return arg.process.bind(arg, argumentParts.phraseAt(index));
            },
            [ArgumentMatches.REST]: (arg, index) => {
                index = arg.index == null ? index : arg.index;
                const rest = argumentParts.phrases.slice(index, index + arg.limit).map(ph => ph.value).join(' ');
                return arg.process.bind(arg, rest);
            },
            [ArgumentMatches.SEPARATE]: (arg, index) => {
                index = arg.index == null ? index : arg.index;
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
            [ArgumentMatches.FLAG]: arg => {
                const flagFound = argumentParts.flagWith(Array.isArray(arg.flag) ? arg.flag : [arg.flag]) != null;
                return () => arg.default == null ? flagFound : !flagFound;
            },
            [ArgumentMatches.OPTION]: arg => {
                const flag = argumentParts.optionFlagWith(Array.isArray(arg.flag) ? arg.flag : [arg.flag]);
                return arg.process.bind(arg, flag ? flag.value : '');
            },
            [ArgumentMatches.TEXT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const text = argumentParts.phrases.slice(index, index + arg.limit).map(ph => ph.value).join(' ');
                return arg.process.bind(arg, text);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const text = argumentParts.content.slice(index, index + arg.limit).join('').trim();
                return arg.process.bind(arg, text);
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

            if ([ArgumentMatches.PHRASE, ArgumentMatches.REST, ArgumentMatches.SEPARATE].includes(matchType)) {
                phraseIndex++;
            }

            const res = await processFunc(message, processed);
            if (res === Symbols.COMMAND_CANCELLED) return res;
            processed[arg.id] = res;
            return process(args.slice(1));
        };

        return process(this.buildArgs(this.args));
    }

    /**
     * Gets the flags that are used in all args.
     * @returns {Object}
     */
    getFlags() {
        const res = {
            flagWords: [],
            optionFlagWords: []
        };

        (function pushFlag(arg) {
            if (arg instanceof Control) {
                pushFlag(arg.getArgs());
                return;
            }

            if (Array.isArray(arg)) {
                for (const a of arg) {
                    pushFlag(a);
                }

                return;
            }

            const arr = res[arg.match === ArgumentMatches.FLAG ? 'flagWords' : 'optionFlagWords'];
            if (arg.match === ArgumentMatches.FLAG || arg.match === ArgumentMatches.OPTION) {
                if (Array.isArray(arg.flag)) {
                    for (const p of arg.flag) {
                        arr.push(p);
                    }
                } else {
                    arr.push(arg.flag);
                }
            }
        }(this.args));

        return res;
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
