const AkairoError = require('../util/AkairoError');
const AkairoModule = require('./AkairoModule');
const Argument = require('./Argument');
const { ArgumentMatches, ArgumentSplits, Symbols } = require('../util/Constants');
const { isPromise } = require('../util/Util');

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string[]} [aliases=[]] - Command names.
 * @prop {Array<ArgumentOptions|ArgumentOptions[]|CommandCancelFunction>|ArgumentFunction} [args=[]] - Arguments to parse.
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
 * A function used to cancel argument parsing midway.
 * If text is returned it will be sent and the command will be cancelled.
 * This behavior can be done manually anywhere else by throwing Constants.Symbols.COMMAND_CANCELLED.
 * @typedef {Function} CommandCancelFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|Promise<string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions>}
 */

/**
 * A function used to check if a message has permissions for the command.
 * @typedef {Function} PermissionFunction
 * @param {Message} message - Message that triggered the command.
 * @returns {boolean|Promise<boolean>}
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
         * @type {Array<Argument|Argument[]|CommandCancelFunction>|ArgumentFunction}
         */
        this.args = typeof args === 'function' ? args.bind(this) : this._buildArgs(args);

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
        if (!this.args.length && typeof this.args !== 'function') return Promise.resolve({});

        const words = this._splitText(content, message);
        const isQuoted = this.split === ArgumentSplits.QUOTED || this.split === ArgumentSplits.STICKY || words.isQuoted;

        if (typeof this.args === 'function') {
            const res = this.args(message, content, words.map(word => {
                word = word.trim();
                if (isQuoted && /^"[^]+"$/.test(word)) {
                    word = word.slice(1, -1);
                }

                return word;
            }));

            return Promise.resolve(res);
        }

        const usedIndices = new Set();
        const prefixes = this._getPrefixes();
        const noPrefixWords = words.filter(w => {
            w = w.trim();

            return !prefixes.some(p => {
                if (!p.flag) return w.toLowerCase().startsWith(p.value);
                return w.toLowerCase() === p.value;
            });
        });

        const parseFuncs = {
            [ArgumentMatches.WORD]: (arg, index) => {
                if (arg.unordered || arg.unordered === 0) {
                    return async (msg, processed) => {
                        const indices = typeof arg.unordered === 'number'
                            ? Array.from(noPrefixWords.keys()).slice(arg.unordered)
                            : Array.isArray(arg.unordered)
                                ? arg.unordered
                                : Array.from(noPrefixWords.keys());

                        for (const i of indices) {
                            const word = (noPrefixWords[i] || '').trim();
                            // eslint-disable-next-line no-await-in-loop
                            const res = await arg.cast(word, msg, processed);
                            if (res != null) {
                                usedIndices.add(i);
                                return res;
                            }
                        }

                        return arg.process('', msg, processed);
                    };
                }

                index = arg.index != null ? arg.index : index;
                let word = (noPrefixWords[index] || '').trim();
                if (isQuoted && /^"[^]+"$/.test(word)) {
                    word = word.slice(1, -1);
                }

                return arg.process.bind(arg, word);
            },
            [ArgumentMatches.REST]: (arg, index) => {
                index = arg.index != null ? arg.index : index;
                const word = noPrefixWords.slice(index, index + arg.limit).join('') || '';
                return arg.process.bind(arg, word);
            },
            [ArgumentMatches.SEPARATE]: (arg, index) => {
                index = arg.index != null ? arg.index : index;
                const wordArr = noPrefixWords.slice(index, index + arg.limit);

                if (!wordArr.length) return arg.process.bind(arg, '');
                return async (msg, processed) => {
                    const res = [];
                    processed[arg.id] = res;

                    for (const word of wordArr) {
                        // eslint-disable-next-line no-await-in-loop
                        res.push(await arg.process(word, msg, processed));
                    }

                    return res;
                };
            },
            [ArgumentMatches.PREFIX]: arg => {
                let prefixUsed;
                let wordFound;

                for (let i = words.length; i--;) {
                    const word = words[i].trim().toLowerCase();

                    if (Array.isArray(arg.prefix)) {
                        let found = false;

                        for (const prefix of arg.prefix) {
                            if (word.startsWith(prefix.toLowerCase())) {
                                prefixUsed = prefix;
                                wordFound = words[i];
                                found = true;
                                break;
                            }
                        }

                        if (found) break;
                    } else if (word.startsWith(arg.prefix.toLowerCase())) {
                        prefixUsed = arg.prefix;
                        wordFound = words[i];
                        break;
                    }
                }

                if (wordFound && prefixUsed) {
                    wordFound = wordFound.replace(prefixUsed, '').trim();
                    if (isQuoted && /^"[^]+"$/.test(wordFound)) {
                        wordFound = wordFound.slice(1, -1);
                    }
                }

                return arg.process.bind(arg, wordFound || '');
            },
            [ArgumentMatches.FLAG]: arg => {
                let flagFound = false;

                for (let i = words.length; i--;) {
                    const word = words[i].trim().toLowerCase();

                    if (Array.isArray(arg.prefix)) {
                        for (const prefix of arg.prefix) {
                            if (word === prefix.toLowerCase()) {
                                flagFound = true;
                                break;
                            }
                        }
                    } else if (word === arg.prefix.toLowerCase()) {
                        flagFound = true;
                        break;
                    }
                }

                return () => arg.default == null ? flagFound : !flagFound;
            },
            [ArgumentMatches.TEXT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const word = noPrefixWords.slice(index, index + arg.limit).join('');
                return arg.process.bind(arg, word);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const word = words.slice(index, index + arg.limit).join('');
                return arg.process.bind(arg, word);
            },
            [ArgumentMatches.NONE]: arg => {
                return arg.process.bind(arg, '');
            }
        };

        const processed = {};
        let wordIndex = 0;

        const process = async i => {
            if (i === this.args.length) return processed;
            let arg = this.args[i];

            if (typeof arg === 'function') {
                let cancel = arg.call(this, message, processed);
                if (isPromise(cancel)) cancel = await cancel;
                if (cancel != null) {
                    if (cancel) await message.channel.send(cancel);
                    throw Symbols.COMMAND_CANCELLED;
                }

                return process(i + 1);
            } else if (Array.isArray(arg)) {
                arg = arg.find(a => a.allow(message, processed));
                if (!arg) return process(i + 1);
            } else if (!arg.allow(message, processed)) {
                return process(i + 1);
            }

            const matchType = typeof arg.match === 'function' ? arg.match(message, processed) : arg.match;
            const processFunc = parseFuncs[matchType](arg, wordIndex);

            if ([ArgumentMatches.WORD, ArgumentMatches.REST, ArgumentMatches.SEPARATE].includes(matchType)) {
                wordIndex++;
            }

            const res = await processFunc(message, processed);
            processed[arg.id] = res;

            let cancel = typeof arg.cancel === 'function'
                ? arg.cancel(res, message, processed)
                : res == null
                    ? arg.cancel
                    : null;

            if (isPromise(cancel)) cancel = await cancel;
            if (cancel != null) {
                if (cancel) await message.channel.send(cancel);
                throw Symbols.COMMAND_CANCELLED;
            }

            return process(i + 1);
        };

        return process(0);
    }

    /**
     * Builds arguments from options.
     * @protected
     * @param {Array<ArgumentOptions|ArgumentOptions[]|CommandCancelFunction>} args - Argument options to build.
     * @returns {Array<Argument|Argument[]|CommandCancelFunction>}
     */
    _buildArgs(args) {
        if (args == null) return [];

        const res = [];
        for (let arg of args) {
            if (Array.isArray(arg)) {
                arg = arg.map(a => new Argument(this, a));
            } else if (typeof arg === 'function') {
                arg = arg.bind(this);
            } else {
                arg = new Argument(this, arg);
            }

            res.push(arg);
        }

        return res;
    }

    /**
     * Splits text into arguments.
     * @protected
     * @param {string} content - String to parse.
     * @param {Message} [message] - Message to use.
     * @returns {string[]}
     */
    _splitText(content, message) {
        const splitFuncs = {
            [ArgumentSplits.PLAIN]: c => c.match(/\S+\s*/g),
            [ArgumentSplits.QUOTED]: c => c.match(/"[^]*?"\s*|\S+\s*|"/g),
            [ArgumentSplits.STICKY]: c => c.match(/[^\s"]*?"[^]*?"\s*|\S+\s*|"/g),
            [ArgumentSplits.NONE]: c => [c]
        };

        return typeof this.split === 'function'
            ? this.split(content, message) || []
            : splitFuncs[this.split]
                ? splitFuncs[this.split](content) || []
                : content.split(this.split);
    }

    /**
     * Gets the prefixes that are used in all args.
     * @protected
     * @returns {Object[]}
     */
    _getPrefixes() {
        const prefixes = [];
        const pushPrefix = arg => {
            if (arg.match === ArgumentMatches.PREFIX || arg.match === ArgumentMatches.FLAG) {
                if (Array.isArray(arg.prefix)) {
                    for (const p of arg.prefix) {
                        prefixes.push({
                            value: p.toLowerCase(),
                            flag: arg.match === ArgumentMatches.FLAG
                        });
                    }
                } else {
                    prefixes.push({
                        value: arg.prefix.toLowerCase(),
                        flag: arg.match === ArgumentMatches.FLAG
                    });
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

        return prefixes;
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
