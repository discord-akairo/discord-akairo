const AkairoModule = require('./AkairoModule');
const Argument = require('./Argument');
const { ArgumentMatches, ArgumentSplits } = require('../util/Constants');

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string[]} [aliases=[]] - Command names.
 * @prop {ArgumentOptions[]} [args=[]] - Arguments to parse.
 * @prop {ArgumentSplit} [split='plain'] - Method to split text into words.
 * @prop {string} [channelRestriction] - Restricts channel: 'guild' or 'dm'.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 * @prop {boolean} [ownerOnly=false] - Whether or not to allow client owner(s) only.
 * @prop {boolean} [protected=false] - Whether or not this command cannot be disabled.
 * @prop {boolean} [typing=false] - Whether or not to type in channel during execution.
 * @prop {boolean} [editable=true] - Whether or not message edits will run this command.
 * On an edited message, the exec function edited param will be true.
 * @prop {number} [cooldown] - The command cooldown in milliseconds.
 * @prop {number} [ratelimit=1] - Amount of command uses allowed until cooldown.
 * @prop {string|string[]|Function} [prefix] - A prefix to overwrite the global one for this command.
 * Can be a function `(message => string|string[])`.
 * @prop {PermissionResolvable[]|Function} [permissions] - Permissions required to run this command.
 * Can be either an array of permission name or a function returning `true or `false`.
 * @prop {RegExp|Function} [trigger] - A regex or function `(message => RegExp)` returning regex to match in messages that are NOT commands.
 * The exec function becomes `((message, match, groups, edited) => any)`.
 * @prop {Function} [condition] - A function `((message, edited) => {})` that returns true or false on messages that are NOT commands.
 * The exec function becomes `((message, edited) => any)`.
 * @prop {PromptOptions} [defaultPrompt={}] - The default prompt options.
 * @prop {Object} [options={}] - An object for custom options.
 * Accessible with `Command#options`.
 * @prop {string|string[]} [description=''] - Description of the command.
 */

/**
 * The method to split text into words.
 * - `plain` splits word separated by whitespace.
 * Extra whitespace between words are ignored.
 * - `split` splits word separated by whitespace.
 * Should not be used due to possible inconsistent whitespace.
 * - `quoted` is similar to plain, but counts text inside double quotes as one word.
 * - `sticky` is similar to quoted, but makes it so that quoted text must have a whitespace or another double quote before it to count as another word.
 *
 * A regex or a character can be used instead (for example, a comma) to split the message by that regex or character.
 * A function `((content, message) => string[])` returning an array of strings can be also used.
 * @typedef {string} ArgumentSplit
 */

/** @extends AkairoModule */
class Command extends AkairoModule {
    /**
     * Creates a new command.
     * @param {string} id - Command ID.
     * @param {Function} exec - Function `((message, args, edited) => any)` called when command is ran.
     * @param {CommandOptions} [options={}] - Options for the command.
     */
    constructor(id, exec, options = {}) {
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
        this.args = (options.args || []).map(a => new Argument(this, a));

        /**
         * The command split method.
         * @type {ArgumentSplit}
         */
        this.split = options.split || ArgumentSplits.PLAIN;

        /**
         * Usable only in this channel type.
         * @type {string}
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
         * @type {number}
         */
        this.cooldown = options.cooldown;

        /**
         * Uses allowed before cooldown.
         * @type {number}
         */
        this.ratelimit = options.ratelimit || 1;

        /**
         * Default prompt options.
         * @type {PromptOptions}
         */
        this.defaultPrompt = options.defaultPrompt || {};

        /**
         * Custom options for the command.
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
         * @type {?string|string[]|Function}
         */
        this.prefix = options.prefix;

        /**
         * Permissions required to run command.
         * @type {PermissionResolvable[]|Function}
         */
        this.permissions = options.permissions;

        /**
         * Gets the regex trigger, if specified.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {RegExp}
         */
        this.trigger = typeof options.trigger === 'function' ? options.trigger : this.trigger || (() => options.trigger);

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
            [ArgumentSplits.PLAIN]: c => c.match(/[^\s]+/g),
            [ArgumentSplits.SPLIT]: c => c.split(' '),
            [ArgumentSplits.QUOTED]: c => c.match(/".*?"|[^\s"]+|"/g),
            [ArgumentSplits.STICKY]: c => c.match(/[^\s"]*?".*?"|[^\s"]+|"/g)
        };

        const words = typeof this.split === 'function'
        ? this.split(content, message) || []
        : splitFuncs[this.split]
        ? splitFuncs[this.split](content) || []
        : content.split(this.split);

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
            return !prefixes.some(p => {
                if (!p.flag) return w.toLowerCase().startsWith(p.value);
                return w.toLowerCase() === p.value;
            });
        });

        const parseFuncs = {
            [ArgumentMatches.WORD]: (arg, index) => {
                let word = noPrefixWords[arg.index != null ? arg.index : index] || '';

                const isQuoted = (this.split === ArgumentSplits.QUOTED || this.split === ArgumentSplits.STICKY) && /^".*"$/.test(word);
                if (isQuoted) word = word.slice(1, -1);

                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.REST]: (arg, index) => {
                const word = noPrefixWords.slice(arg.index != null ? arg.index : index).join(' ') || '';
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.PREFIX]: arg => {
                let prefixUsed;
                let word;

                for (let i = words.length; i--;) {
                    const w = words[i];
                    if (Array.isArray(arg.prefix)) {
                        for (const prefix of arg.prefix) {
                            if (w.toLowerCase().startsWith(prefix.toLowerCase())) {
                                prefixUsed = prefix;
                                word = w;
                                break;
                            }
                        }
                    } else
                    if (w.toLowerCase().startsWith(arg.prefix.toLowerCase())) {
                        prefixUsed = arg.prefix;
                        word = w;
                        break;
                    }
                }

                if (word && prefixUsed) {
                    word = word.replace(prefixUsed, '');
                    if (this.split === ArgumentSplits.STICKY && /^".*"$/.test(word)) word = word.slice(1, -1);
                }

                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.FLAG]: arg => {
                let word;

                for (let i = words.length; i--;) {
                    const w = words[i];
                    if (Array.isArray(arg.prefix)) {
                        for (const prefix of arg.prefix) {
                            if (w.toLowerCase().startsWith(prefix.toLowerCase())) {
                                word = w;
                                break;
                            }
                        }
                    } else
                    if (w.toLowerCase().startsWith(arg.prefix.toLowerCase())) {
                        word = w;
                        break;
                    }
                }

                return () => Promise.resolve(arg.default() ? !word : !!word);
            },
            [ArgumentMatches.TEXT]: arg => {
                const word = noPrefixWords.slice(arg.index).join(' ');
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const word = content.split(' ').slice(arg.index).join(' ');
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
