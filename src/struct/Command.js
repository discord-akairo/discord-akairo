const AkairoModule = require('./AkairoModule');
const Argument = require('./Argument');
const { ArgumentMatches, ArgumentSplits } = require('../util/Constants');

/**
 * Represents a command.
 * @param {string} id - Command ID.
 * @param {CommandExecFunction|RegexCommandExecFunction|ConditionalCommandExecFunction} exec - Function called when command is ran.
 * @param {CommandOptions} [options={}] - Options for the command.
 * @extends {AkairoModule}
 */
class Command extends AkairoModule {
    constructor(id, exec, options) {
        if (!options && typeof exec === 'object') {
            options = exec;
            exec = null;
        }

        super(id, exec, options);

        /**
         * Command names.
         * @type {string[]}
         */
        this.aliases = options.aliases || [];

        /**
         * Arguments for the command.
         * @type {Argument[]}
         */
        this.args = options.args ? options.args.map(a => new Argument(this, a)) : [];

        /**
         * The command split method.
         * @type {ArgumentSplit}
         */
        this.split = options.split || this.split || ArgumentSplits.PLAIN;

        /**
         * Usable only in this channel type.
         * @type {?string}
         */
        this.channelRestriction = options.channelRestriction;

        /**
         * Usable only by the client owner.
         * @type {boolean}
         */
        this.ownerOnly = !!options.ownerOnly;

        /**
         * Whether or not this command cannot be disabled.
         * @type {boolean}
         */
        this.protected = !!options.protected;

        /**
         * Whether or not this command can be ran by an edit.
         * @type {boolean}
         */
        this.editable = options.editable === undefined ? true : !!options.editable;

        /**
         * Whether or not to type during command execution.
         * @type {boolean}
         */
        this.typing = !!options.typing;

        /**
         * Cooldown in milliseconds.
         * @type {?number}
         */
        this.cooldown = options.cooldown;

        /**
         * Uses allowed before cooldown.
         * @type {number}
         */
        this.ratelimit = options.ratelimit || 1;

        /**
         * Default prompt options.
         * @type {ArgumentPromptOptions}
         */
        this.defaultPrompt = options.defaultPrompt || {};

        /**
         * Custom options for the command.
         * @deprecated Extend the class.
         * @type {Object}
         */
        this.options = options.custom || options.options || {};

        /**
         * Description of the command.
         * @type {string}
         */
        this.description = (Array.isArray(options.description) ? options.description.join('\n') : options.description) || '';

        /**
         * Command prefix overwrite.
         * @type {?string|string[]|PrefixFunction}
         */
        this.prefix = options.prefix !== undefined ? options.prefix : this.prefix;

        /**
         * Permissions required to run command by the client.
         * @type {PermissionResolvable|PermissionResolvable[]|PermissionFunction}
         */
        this.clientPermissions = options.clientPermissions || this.clientPermissions;

        /**
         * Permissions required to run command by the user.
         * @type {PermissionResolvable|PermissionResolvable[]|PermissionFunction}
         */
        this.userPermissions = options.userPermissions || this.userPermissions;

        /**
         * Gets the regex trigger, if specified.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {RegExp}
         */
        this.trigger = (typeof options.trigger === 'function' ? options.trigger : this.trigger) || (() => options.trigger);

        /**
         * Gets the condition trigger, if specified.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {boolean}
         */
        this.condition = options.condition || this.condition || (() => false);

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
         * @param {boolean} edited - Whether the user's message was edited.
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

        const prefixes = this.args.reduce((arr, arg) => {
            if (arg.match === ArgumentMatches.PREFIX || arg.match === ArgumentMatches.FLAG) {
                if (Array.isArray(arg.prefix)) {
                    for (const p of arg.prefix) {
                        arr.push({
                            value: p.toLowerCase(),
                            flag: arg.match === ArgumentMatches.FLAG
                        });
                    }
                } else {
                    arr.push({
                        value: arg.prefix.toLowerCase(),
                        flag: arg.match === ArgumentMatches.FLAG
                    });
                }
            }

            return arr;
        }, []);

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
                    } else if (w.toLowerCase().startsWith(arg.prefix.toLowerCase())) {
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
                    } else if (w.toLowerCase().startsWith(arg.prefix.toLowerCase())) {
                        word = w;
                        break;
                    }
                }

                return () => Promise.resolve(arg.default() ? !word : !!word);
            },
            [ArgumentMatches.TEXT]: arg => {
                const joiner = this.split === ArgumentSplits.SPLIT ? ' ' : '';
                const index = arg.index == null ? 0 : arg.index;
                const word = noPrefixWords.slice(index).join(joiner);
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const word = content.split(' ').slice(index).join(' ');
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.NONE]: arg => {
                return arg.cast.bind(arg, '');
            }
        };

        const processed = {};
        let wordIndex = 0;

        const process = i => {
            if (i === this.args.length) return processed;

            const arg = this.args[i];
            const matchType = typeof arg.match === 'function' ? arg.match.call(this, message, processed) : arg.match;
            const castFunc = parseFuncs[matchType](arg, wordIndex);

            if (matchType === ArgumentMatches.WORD || matchType === ArgumentMatches.REST) wordIndex++;

            return castFunc(message, processed).then(res => {
                processed[arg.id] = res;
                return process(i + 1);
            });
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

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string[]} [aliases=[]] - Command names.
 * @prop {ArgumentOptions[]} [args=[]] - Arguments to parse.
 * @prop {ArgumentSplit|ArgumentSplitFunction} [split='plain'] - Method to split text into words.
 * @prop {string} [channelRestriction] - Restricts channel: 'guild' or 'dm'.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 * @prop {boolean} [ownerOnly=false] - Whether or not to allow client owner(s) only.
 * @prop {boolean} [protected=false] - Whether or not this command cannot be disabled.
 * @prop {boolean} [typing=false] - Whether or not to type in channel during execution.
 * @prop {boolean} [editable=true] - Whether or not message edits will run this command.
 * On an edited message, the exec function edited param will be true.
 * @prop {number} [cooldown] - The command cooldown in milliseconds.
 * @prop {number} [ratelimit=1] - Amount of command uses allowed until cooldown.
 * @prop {string|string[]|PrefixFunction} [prefix] - The prefix(es) to overwrite the global one for this command.
 * @prop {PermissionResolvable|PermissionResolvable[]|PermissionFunction} [userPermissions] - Permissions required by the user to run this command.
 * @prop {PermissionResolvable|PermissionResolvable[]|PermissionFunction} [clientPermissions] - Permissions required by the client to run this command.
 * @prop {RegExp|TriggerFunction} [trigger] - A regex to match in messages that are NOT commands.
 * The exec function becomes `((message, match, groups, edited) => any)`.
 * @prop {ConditionFunction} [condition] - Whether or not to run on messages that are NOT commands.
 * The exec function becomes `((message, edited) => any)`.
 * @prop {ArgumentPromptOptions} [defaultPrompt={}] - The default prompt options.
 * @prop {Object} [options={}] - An object for custom options.
 * @prop {string|string[]} [description=''] - Description of the command.
 */

/**
 * A function used to check if a message has permissions for the command.
 * @typedef {Function} PermissionFunction
 * @param {Message} message - Message that triggered the command.
 * @returns {boolean}
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
 * DEPRECATED: no alternatives.
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
 * DEPRECATED: Use Messaged#edited.
 * @returns {any}
 */

/**
 * The command's execution function when triggered with a regex.
 * @typedef {Function} RegexCommandExecFunction
 * @param {Message} message - Message that triggered the command.
 * @param {any} match - The results from `string.match()` with the regex.
 * @param {string[]} groups - The matched groups if a global regex.
 * @param {boolean} edited - Whether the user's message was edited.
 * DEPRECATED: Use Messaged#edited.
 * @returns {any}
 */

/**
 * The command's execution function when triggered with a condition.
 * @typedef {Function} ConditionalCommandExecFunction
 * @param {Message} message - Message that triggered the command.
 * @param {boolean} edited - Whether the user's message was edited.
 * DEPRECATED: Use Messaged#edited.
 * @returns {any}
 */
