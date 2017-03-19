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
 * @prop {boolean} [editable=true] - Whether or not message edits will run this command.
 * <br>On an edited message, the exec function edited param will be true.
 * @prop {number} [cooldown] - The command cooldown in milliseconds.
 * @prop {number} [ratelimit=1] - Amount of command uses allowed until cooldown.
 * @prop {string|string[]} [prefix] - A prefix to overwrite the global one for this command.
 * @prop {RegExp|function} [trigger] - A regex or function <code>(message => {})</code> returning regex to match in messages that are NOT commands.
 * <br>The exec function is <code>((message, match, groups, edited) => {})</code>.
 * @prop {function} [condition] - A function <code>((message, edited) => {})</code> that returns true or false on messages that are NOT commands.
 * <br>The exec function is <code>((message, edited) => {})</code>.
 * @prop {PromptOptions} [defaultPrompt={}] - The default prompt options.
 * @prop {Object} [options={}] - An object for custom options.
 * @prop {string|string[]} [description=''] - Description of the command.
 * <br>Accessible with Command#options.
 */

/**
 * The method to split text into words.
 * <br><code>plain</code> splits word separated by whitespace. Extra whitespace is ignored.
 * <br><code>split</code> splits word separated by whitespace.
 * <br><code>quoted</code> is similar to plain, but counts text inside double quotes as one word.
 * <br><code>sticky</code> is similar to quoted, but makes it so that quoted text must have a whitespace/another double quote before it to count as another word.
 * <br>
 * <br>A regex or a character can be used instead (for example, a comma) to split the message by that regex or character.
 * @typedef {string} ArgumentSplit
 */

/** @extends AkairoModule */
class Command extends AkairoModule {
    /**
     * Creates a new command.
     * @param {string} id - Command ID.
     * @param {Function} exec - Function <code>((message, args, edited) => {})</code> called when command is ran.
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
        this.editable = !(options.editable === false);

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
         * @type {?string|string[]}
         */
        this.prefix = options.prefix;

        /**
         * Gets the regex trigger, if specified.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {RegExp}
         */
        this.trigger = typeof options.trigger === 'function' ? options.trigger : () => options.trigger;

        /**
         * Gets the condition trigger, if specified.
         * @method
         * @param {Message} message - Message being handled.
         * @returns {boolean}
         */
        this.condition = options.condition || (() => false);

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
            [ArgumentSplits.PLAIN]: () => content.match(/[^\s]+/g),
            [ArgumentSplits.SPLIT]: () => content.split(' '),
            [ArgumentSplits.QUOTED]: () => content.match(/".*?"|[^\s"]+|"/g),
            [ArgumentSplits.STICKY]: () => content.match(/[^\s"]*?".*?"|[^\s"]+|"/g)
        };

        const words = splitFuncs[this.split] ? splitFuncs[this.split]() || [] : content.split(this.split);
        const args = {};

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

        console.log(prefixes, noPrefixWords);

        let index = 0;

        const parseFuncs = {
            [ArgumentMatches.WORD]: arg => {
                let word = noPrefixWords[arg.index != null ? arg.index : index] || '';

                const isQuoted = (this.split === ArgumentSplits.QUOTED || this.split === ArgumentSplits.STICKY) && /^".*"$/.test(word);
                if (isQuoted) word = word.slice(1, -1);

                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.REST]: arg => {
                const word = noPrefixWords.slice(arg.index != null ? arg.index : index).join(' ') || '';
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.PREFIX]: arg => {
                let word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w.toLowerCase().startsWith(p.toLowerCase())) : w.toLowerCase().startsWith(arg.prefix.toLowerCase())) || '';

                word = word.replace(prefixes.find(p => {
                    if (!p.flag) return word.toLowerCase().startsWith(p.value);
                    return word.toLowerCase() === p.value;
                }).value, '');

                if (this.split === ArgumentSplits.STICKY && /^".*"$/.test(word)) word = word.slice(1, -1);

                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.FLAG]: arg => {
                const word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w.toLowerCase() === p.toLowerCase()) : w.toLowerCase() === arg.prefix.toLowerCase()) || '';
                return () => Promise.resolve(!!word);
            },
            [ArgumentMatches.TEXT]: arg => {
                const word = noPrefixWords.slice(arg.index).join(' ');
                return arg.cast.bind(arg, word);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const word = content.split(' ').slice(arg.index).join(' ');
                return arg.cast.bind(arg, word);
            }
        };

        for (const arg of this.args) {
            args[arg.id] = parseFuncs[arg.match](arg);
            if (arg.match === ArgumentMatches.WORD || arg.match === ArgumentMatches.REST) index++;
        }

        const processed = {};
        const keys = Object.keys(args);

        const process = i => {
            if (i === keys.length) return processed;

            const key = keys[i];
            return args[key](message, processed).then(res => {
                processed[key] = res;
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
