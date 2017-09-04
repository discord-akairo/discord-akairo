const AkairoModule = require('./AkairoModule');
const Argument = require('./Argument');
const { ArgumentMatches, ArgumentSplits } = require('../util/Constants');

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string[]} [aliases=[]] - Command names.
 * @prop {ArgumentOptions[]|ArgumentOptions[][]} [args=[]] - Arguments to parse.
 * When an item is an array of arguments, the first argument that is allowed to run will be ran.
 * @prop {ArgumentSplit|ArgumentSplitFunction} [split='plain'] - Method to split text into words.
 * @prop {string} [channel] - Restricts channel to either 'guild' or 'dm'.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 * @prop {boolean} [ownerOnly=false] - Whether or not to allow client owner(s) only.
 * @prop {boolean} [protected=false] - Whether or not this command cannot be disabled.
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
 * @prop {Object} [options={}] - An object for custom options.
 * @prop {string|string[]} [description=''] - Description of the command.
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
 * A function used to check if the command should run.
 * @typedef {Function} ConditionFunction
 * @param {Message} message - Message to check.
 * @returns {boolean}
 */

/**
 * The method to split text into words.
 * - `plain` splits word separated by whitespace.
 * Extra whitespace between words are ignored.
 * - `split` splits word separated by whitespace.
 * Should not be used due to possible inconsistent whitespace.
 * - `quoted` is similar to plain, but counts text inside double quotes as one word.
 * - `sticky` is similar to quoted, but makes it so that quoted text must have a whitespace or another double quote before it.
 * This means that `thing="hello world"` would be one, rather than two like when using `quoted`.
 * - `none` gives the entire content.
 *
 * It is recommended that you use either `plain` or `sticky` for your commands.
 *
 * A regex or a character can be used instead (for example, a comma) to split the message by that regex or character.
 * @typedef {string|RegExp} ArgumentSplit
 */

/**
 * A function that returns the words to use for the arguments.
 * @typedef {Function} ArgumentSplitFunction
 * @param {string} content - The message content without the prefix and command.
 * @param {Message} message - Message that triggered the command.
 * @returns {string[]}
 */

/**
 * The command's execution function.
 * @typedef {Function} CommandExecFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} args - Evaluated arguments.
 * @param {boolean} edited - Whether the user's message was edited.
 * @returns {any}
 */

/** @extends AkairoModule */
class Command extends AkairoModule {
    /**
     * Creates a new command.
     * @param {string} id - Command ID.
     * @param {CommandExecFunction} exec - Function called when command is ran.
     * @param {CommandOptions} [options={}] - Options for the command.
     */
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

        super(id, exec, options);

        const {
            aliases = [],
            args = [],
            split = this.split || ArgumentSplits.PLAIN,
            channel,
            ownerOnly = false,
            protect = false,
            editable = true,
            typing = false,
            cooldown,
            ratelimit = 1,
            defaultPrompt = {},
            options: opts = {},
            description = '',
            prefix = this.prefix,
            clientPermissions = this.clientPermissions,
            userPermissions = this.userPermissions,
            trigger = this.trigger,
            condition = this.condition
        } = options;

        /**
         * Command names.
         * @type {string[]}
         */
        this.aliases = aliases;

        /**
         * Arguments for the command.
         * @type {Argument[]}
         */
        this.args = args.map(arg => Array.isArray(arg) ? arg.map(a => new Argument(this, a)) : new Argument(this, arg));

        /**
         * The command split method.
         * @type {ArgumentSplit}
         */
        this.split = split;

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
         * Whether or not this command cannot be disabled.
         * @type {boolean}
         */
        this.protected = Boolean(protect);

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
         * Custom options for the command.
         * @type {Object}
         */
        this.options = opts;

        /**
         * Description of the command.
         * @type {string}
         */
        this.description = Array.isArray(description) ? description.join('\n') : description;

        /**
         * Command prefix overwrite.
         * @type {?string|string[]|PrefixFunction}
         */
        this.prefix = prefix;

        /**
         * Permissions required to run command by the client.
         * @type {PermissionResolvable|PermissionResolvable[]|PermissionFunction}
         */
        this.clientPermissions = clientPermissions;

        /**
         * Permissions required to run command by the user.
         * @type {PermissionResolvable|PermissionResolvable[]|PermissionFunction}
         */
        this.userPermissions = userPermissions;

        /**
         * Gets the regex trigger, if specified.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {RegExp}
         */
        this.trigger = typeof trigger === 'function' ? trigger : () => trigger;

        /**
         * Gets the condition trigger, if specified.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {boolean}
         */
        this.condition = typeof condition === 'function' ? condition : () => Boolean(condition);

        /**
         * The ID of this command.
         * @name Command#id
         * @type {string}
         */

        /**
         * Executes the command.
         * @method
         * @name Command#exec
         * @param {Message} message - Message that triggered the command.
         * @param {Object} args - Evaluated arguments.
         * @returns {any}
         */

        /**
         * The command handler.
         * @readonly
         * @name Command#handler
         * @type {CommandHandler}
         */
    }

    /**
     * Parses text based on this command's args.
     * @param {string} content - String to parse.
     * @param {Message} [message] - Message to use.
     * @returns {Promise<Object>}
     */
    parse(content, message) {
        if (!this.args.length) return Promise.resolve({});

        const splitFuncs = {
            [ArgumentSplits.PLAIN]: c => c.match(/[\S\n]+\s?/g),
            [ArgumentSplits.SPLIT]: c => c.split(' '),
            [ArgumentSplits.QUOTED]: c => c.match(/"[\s\S]*?"\s?|[\S\n]+\s?|"/g),
            [ArgumentSplits.STICKY]: c => c.match(/[^\s"]*?"[\s\S]*?"\s?|[\S\n]+\s?|"/g),
            [ArgumentSplits.NONE]: c => [c]
        };

        const words = typeof this.split === 'function'
            ? this.split(content, message) || []
            : splitFuncs[this.split]
                ? splitFuncs[this.split](content) || []
                : content.split(this.split);

        const isQuoted = this.split === ArgumentSplits.QUOTED || this.split === ArgumentSplits.STICKY || words.isQuoted;

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

        const noPrefixWords = words.filter(w => {
            w = w.trim();

            return !prefixes.some(p => {
                if (!p.flag) return w.toLowerCase().startsWith(p.value);
                return w.toLowerCase() === p.value;
            });
        });

        const parseFuncs = {
            [ArgumentMatches.WORD]: (arg, index) => {
                let word = noPrefixWords[arg.index != null ? arg.index : index] || '';
                if (isQuoted && /^"[^]+"$/.test(word.trim())) word = word.trim().slice(1, -1);
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.REST]: (arg, index) => {
                const joiner = this.split === ArgumentSplits.SPLIT ? ' ' : '';
                const word = noPrefixWords.slice(arg.index != null ? arg.index : index).join(joiner) || '';
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.SEPARATE]: (arg, index) => {
                const wordArr = noPrefixWords.slice(arg.index != null ? arg.index : index);
                return async (m, p) => {
                    const res = [];
                    p[arg.id] = res;

                    for (const word of wordArr) {
                        // eslint-disable-next-line no-await-in-loop
                        res.push(await arg.cast(word, m, p));
                    }

                    return res;
                };
            },
            [ArgumentMatches.PREFIX]: arg => {
                let prefixUsed;
                let word;

                for (let i = words.length; i--;) {
                    const w = words[i].trim();

                    if (Array.isArray(arg.prefix)) {
                        let found = false;

                        for (const prefix of arg.prefix) {
                            if (w.toLowerCase().startsWith(prefix.toLowerCase())) {
                                prefixUsed = prefix;
                                word = w;
                                found = true;
                                break;
                            }
                        }

                        if (found) break;
                    } else
                    if (w.toLowerCase().startsWith(arg.prefix.toLowerCase())) {
                        prefixUsed = arg.prefix;
                        word = w;
                        break;
                    }
                }

                if (word && prefixUsed) {
                    word = word.replace(prefixUsed, '');
                    if (isQuoted && /^"[^]+"$/.test(word.trim())) word = word.trim().slice(1, -1);
                }

                return arg.cast.bind(arg, word || '');
            },
            [ArgumentMatches.FLAG]: arg => {
                let word;

                for (let i = words.length; i--;) {
                    const w = words[i].trim();

                    if (Array.isArray(arg.prefix)) {
                        let found = false;

                        for (const prefix of arg.prefix) {
                            if (w.toLowerCase().startsWith(prefix.toLowerCase())) {
                                word = w;
                                found = true;
                                break;
                            }
                        }

                        if (found) break;
                    } else
                    if (w.toLowerCase().startsWith(arg.prefix.toLowerCase())) {
                        word = w;
                        break;
                    }
                }

                return async (m, p) => await arg.default(m, p) == null ? !word : Boolean(word);
            },
            [ArgumentMatches.TEXT]: arg => {
                const joiner = this.split === ArgumentSplits.SPLIT ? ' ' : '';
                const word = arg.index ? noPrefixWords.join(joiner) : noPrefixWords.slice(arg.index).join(joiner);
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const word = arg.index ? content : content.split(' ').slice(arg.index).join(' ');
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.NONE]: arg => {
                return arg.cast.bind(arg, '');
            }
        };

        const processed = {};
        let wordIndex = 0;

        const process = async i => {
            if (i === this.args.length) return processed;

            let arg = this.args[i];
            if (Array.isArray(arg)) {
                arg = arg.find(a => a.allow(message, processed));
                if (!arg) return process(i + 1);
            } else
            if (!arg.allow(message, processed)) {
                return process(i + 1);
            }

            const matchType = typeof arg.match === 'function' ? arg.match(message, processed) : arg.match;
            const castFunc = parseFuncs[matchType](arg, wordIndex);

            if (matchType === ArgumentMatches.WORD || matchType === ArgumentMatches.REST) wordIndex++;

            const res = await castFunc(message, processed);
            processed[arg.id] = res;
            return process(i + 1);
        };

        return process(0);
    }

    /**
     * Disables the command.
     * @returns {boolean}
     */
    disable() {
        if (this.protected) return false;
        return super.disable();
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

    /**
     * Enables the command.
     * @method
     * @name Command#enable
     * @returns {boolean}
     */
}

module.exports = Command;
