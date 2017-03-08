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
 * @prop {boolean} [editable=false] - Whether or not message edits will run this command.
 * <br>On an edited message, the exec function edited param will be true.
 * @prop {number} [cooldown] - The command cooldown in milliseconds.
 * @prop {number} [ratelimit=1] - Amount of command uses allowed until cooldown.
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
     * @param {function} exec - Function <code>((message, args, edited) => {})</code> called when command is ran.
     * @param {CommandOptions} [options={}] - Options for the command.
     */
    constructor(id, exec, options = {}){
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
        this.editable = !!options.editable;

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
     * The command handler.
     * <br>Alias to this.handler.
     * @readonly
     * @type {CommandHandler}
     */
    get commandHandler(){
        return this.handler;
    }

    /**
     * Parses text based on this command's args.
     * @param {string} content - String to parse.
     * @param {Message} [message] - Message to use.
     * @returns {Promise.<Object>}
     */
    parse(content, message){
        if (!this.args.length) return Promise.resolve({});

        const splitFunc = {
            [ArgumentSplits.PLAIN]: () => content.match(/[^\s]+/g),
            [ArgumentSplits.SPLIT]: () => content.split(' '),
            [ArgumentSplits.QUOTED]: () => content.match(/".*?"|[^\s"]+|"/g),
            [ArgumentSplits.STICKY]: () => content.match(/[^\s"]*?".*?"|[^\s"]+|"/g)
        };

        const words = splitFunc[this.split] ? splitFunc[this.split]() || [] : content.split(this.split);
        const args = {};

        const wordArgs = this.args.filter(arg => arg.match === ArgumentMatches.WORD || arg.match === ArgumentMatches.REST);
        const prefixArgs = this.args.filter(arg => arg.match === ArgumentMatches.PREFIX);
        const flagArgs = this.args.filter(arg => arg.match === ArgumentMatches.FLAG);
        const textArgs = this.args.filter(arg => arg.match === ArgumentMatches.TEXT);
        const contentArgs = this.args.filter(arg => arg.match === ArgumentMatches.CONTENT);

        const prefixes = [];
        for (const arg of [...prefixArgs, ...flagArgs]){
            Array.isArray(arg.prefix) ? prefixes.push(...arg.prefix) : prefixes.push(arg.prefix);
        }

        const noPrefixWords = words.filter(w => !prefixes.some(p => w.startsWith(p)));

        for (const [i, arg] of wordArgs.entries()){
            if (arg.match === ArgumentMatches.REST){
                const word = noPrefixWords.slice(arg.index != null ? arg.index : i).join(' ') || '';
                args[arg.id] = arg.cast.bind(arg, word, message);
                continue;
            }

            let word = noPrefixWords[arg.index != null ? arg.index : i] || '';

            if ((this.split === ArgumentSplits.QUOTED || this.split === ArgumentSplits.STICKY) && /^".*"$/.test(word)) word = word.slice(1, -1);

            args[arg.id] = arg.cast.bind(arg, word, message);
        }

        if (prefixArgs.length || flagArgs.length) words.reverse();

        for (const arg of prefixArgs){
            let word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w.startsWith(p)) : w.startsWith(arg.prefix)) || '';
            word = word.replace(prefixes.find(p => word.startsWith(p)), '');
            
            if (this.split === ArgumentSplits.STICKY && /^".*"$/.test(word)) word = word.slice(1, -1);

            args[arg.id] = arg.cast.bind(arg, word, message);
        }

        for (const arg of flagArgs){
            const word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w === p) : w === arg.prefix);
            args[arg.id] = () => Promise.resolve(!!word);
        }

        for (const arg of textArgs){
            const word = noPrefixWords.slice(arg.index).join(' ');
            args[arg.id] = arg.cast.bind(arg, word, message);
        }

        for (const arg of contentArgs){
            const word = content.split(' ').slice(arg.index).join(' ');
            args[arg.id] = arg.cast.bind(arg, word, message);
        }

        const props = [];
        const keys = Object.keys(args);

        const process = i => {
            if (i === keys.length) return props;

            const key = keys[i];
            return args[key]().then(res => {
                props.push(res);
                return process(i + 1);
            });
        };

        return process(0).then(values => {
            return values.reduce((res, prop, i) => {
                res[keys[i]] = prop;
                return res;
            }, args);
        });
    }

    /**
     * Disables the command.
     * @returns {boolean}
     */
    disable(){
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
