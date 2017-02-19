const AkairoModule = require('./AkairoModule');
const { ArgumentMatches, ArgumentTypes, ArgumentSplits } = require('../util/Constants');

/**
 * An argument in a command.
 * @typedef {Object} Argument
 * @prop {string} id - ID of the argument.
 * @prop {ArgumentMatch} [match='word'] - Method to match argument.
 * @prop {ArgumentType|string[]|function} [type='string'] - Attempts to cast argument to this type.<br/>An array or a function can be used (more details in ArgumentType).
 * @prop {string|string[]} [prefix] - Ignores word order and uses a word that starts with/matches this prefix (or multiple prefixes if array).<br/>Applicable to 'prefix' and 'flag' only.
 * @prop {number} [index] - Word to start from.<br/>Applicable to 'word', 'text', or 'content' only.<br/>When using with word, this will offset all word arguments after it by 1 unless the index property is also specified for them.
 * @prop {string|number} [defaultValue=''] - Default value if a word is not inputted or a type could not be casted to.<br/>Can also be a function <code>(message => {})</code>.
 * @prop {string|string[]} [description=''] - A description of the argument.
 */

/**
 * The method to match arguments from text.
 * <br/>Possible strings are:
 * <br/>
 * <br/><code>'word'</code> Matches by the order of the words inputted.<br/>Ignores words that matches prefix or flag.
 * <br/>
 * <br/><code>'rest'</code> Matches the rest of the words in order.<br/>Ignores words that matches prefix or flag.
 * <br/>
 * <br/><code>'prefix'</code> Matches words that starts with the prefix.<br/>The word after the prefix is the evaluated argument.
 * <br/>
 * <br/><code>'flag'</code> Matches words that equal this prefix.<br/>The evaluated argument is true or false.
 * <br/>
 * <br/><code>'text'</code> Matches the entire text, except for the command, ignoring words that matches prefix or flag.
 * <br/>
 * <br/><code>'content'</code> Matches the entire text as it was inputted, except for the command.
 * @typedef {string} ArgumentMatch
 */

/**
 * The type that the argument should be cast to.
 * <br/>Possible strings are:
 * <br/>
 * <br/><code>'string'</code> Does not cast to any type.
 * <br/>
 * <br/><code>'number'</code> Casts to an number with parseFloat(), default value if not a number.
 * <br/>
 * <br/><code>'integer'</code> Casts to an integer with parseInt(), default value if not a number.
 * <br/>
 * <br/><code>'dynamic'</code> Casts to a number with parseFloat() or a string if the argument is not a number.
 * <br/>
 * <br/><code>'dynamicInt'</code> Casts to an integer with parseInt() or a string if the argument is not a number.
 * <br/>
 * <br/>Possible Discord-related strings:
 * <br/>
 * <br/><code>'user'</code> Tries to resolve to a user.
 * <br/>
 * <br/><code>'member'</code> Tries to resolve to a member.
 * <br/>
 * <br/><code>'channel'</code> Tries to resolve to a channel.
 * <br/>
 * <br/><code>'textChannel'</code> Tries to resolve to a text channel.
 * <br/>
 * <br/><code>'voiceChannel'</code> Tries to resolve to a voice channel.
 * <br/>
 * <br/><code>'role'</code> Tries to resolve to a role.
 * <br/>
 * <br/><code>'emoji'</code> Tries to resolve to a custom emoji.
 * <br/>
 * <br/>Many of these types can only be used in a guild.
 * <br/>If any of the above are invalid, the default value will be resolved (recommended to use an ID).
 * <br/>
 * <br/>An array of strings can be used to restrict input to only those strings, case insensitive.
 * <br/>The evaluated argument will be all lowercase.
 * <br/>If the input is not in the array, the default value is used.
 * <br/>
 * <br/>A function <code>((word, message) => {})</code> can also be used to filter or modify arguments.
 * <br/>A return value of true will let the word pass, a falsey return value will use the default value for the argument.
 * <br/>Any other truthy return value will be used as the argument.
 * @typedef {string|string[]} ArgumentType
 */

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {Argument[]} [args=[]] - Arguments to parse.
 * @prop {string} [aliases=[]] - Command names.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 * @prop {string|string[]} [description=''] - Description of the command.
 * @prop {boolean} [ownerOnly=false] - Whether or not to allow client owner(s) only.
 * @prop {string} [channelRestriction='none'] - Restricts channel: 'guild' or 'dm'.
 * @prop {ArgumentSplit} [split='plain'] - Method to split text into words.
 * @prop {RegExp|function} [trigger] - A regex or function <code>(message => {})</code> returning regex to match in messages that are NOT commands.<br/>The exec function is now <code>((message, match) => {})</code> if non-global.<br/>Or, <code>((message, match, groups) => {})</code> if global.
 * @prop {function} [condition] - A function <code>(message => {})</code> that returns true or false on messages that are NOT commands. <br/>The exec function is now <code>(message => {})</code>.
 * @prop {Object} [options={}] - An object for custom options.<br/>Accessible with Command#options.
 */

/**
 * The method to split text into words.
 * <br/>Possible strings are:
 * <br/>
 * <br/><code>'plain'</code> Splits word separated by whitespace.<br/>Extra whitespace is ignored.
 * <br/>
 * <br/><code>'split'</code> Splits word separated by whitespace.
 * <br/>
 * <br/><code>'quoted'</code> This is like plain, but counts text inside double quotes as one word.
 * <br/>
 * <br/><code>'sticky'</code> This is like quoted, but makes it so that quoted text must have a whitespace/another double quote before it to count as another word.<br/>It will still span multiple words.
 * <br/>
 * <br/>A regex or a character can be used instead (for example, a comma) to split the message by that regex or character.
 * @typedef {string} ArgumentSplit
 */

/** @extends AkairoModule */
class Command extends AkairoModule {
    /**
     * Creates a new command.
     * @param {string} id - Command ID.
     * @param {function} exec - Function <code>((message, args) => {})</code> called when command is ran.
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
        this.args = options.args || [];
        for (const arg of this.args){
            if (!arg.match) arg.match = ArgumentMatches.WORD;
            if (!arg.type) arg.type = ArgumentTypes.STRING;
            if (!arg.defaultValue) arg.defaultValue = '';

            if (Array.isArray(arg.description)) arg.description = arg.description.join('\n');
            if (!arg.description) arg.description = '';
        }

        /**
         * Description of the command.
         * @type {string}
         */
        this.description = (Array.isArray(options.description) ? options.description.join('\n') : options.description) || '';

        /**
         * Usable only by the client owner.
         * @type {boolean}
         */
        this.ownerOnly = !!options.ownerOnly;

        /**
         * Usable only in this channel type.
         * @type {string}
         */
        this.channelRestriction = options.channelRestriction || 'none';

        /**
         * The command split method.
         * @type {ArgumentSplit}
         */
        this.split = options.split || ArgumentSplits.PLAIN;

        /**
         * Custom options for the command.
         * @type {Object}
         */
        this.options = options.custom || options.options || {};

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
         * @returns {*}
         */

        /**
         * The command handler.
         * @readonly
         * @name Command#handler
         * @type {CommandHandler}
         */
    }

    /**
     * The command handler.<br/>Alias to this.handler.
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
     * @returns {Object}
     */
    parse(content, message){
        if (this.args.length === 0) return {};

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
                args[arg.id] = this._processType(arg, word, message);
                continue;
            }

            let word = noPrefixWords[arg.index != null ? arg.index : i] || '';

            if ((this.split === ArgumentSplits.QUOTED || this.split === ArgumentSplits.STICKY) && /^".*"$/.test(word)) word = word.slice(1, -1);

            args[arg.id] = this._processType(arg, word, message);
        }

        if (prefixArgs.length || flagArgs.length) words.reverse();

        for (const arg of prefixArgs){
            let word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w.startsWith(p)) : w.startsWith(arg.prefix)) || '';
            word = word.replace(prefixes.find(p => word.startsWith(p)), '');
            
            if (this.split === ArgumentSplits.STICKY && /^".*"$/.test(word)) word = word.slice(1, -1);

            args[arg.id] = this._processType(arg, word, message);
        }

        for (const arg of flagArgs){
            const word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w === p) : w === arg.prefix);
            args[arg.id] = !!word;
        }

        for (const arg of textArgs){
            const def = typeof arg.defaultValue === 'function' ? arg.defaultValue(message) : arg.defaultValue;
            const word = noPrefixWords.slice(arg.index).join(' ') || def;

            args[arg.id] = this._processType(arg, word, message);
        }

        for (const arg of contentArgs){
            const def = typeof arg.defaultValue === 'function' ? arg.defaultValue(message) : arg.defaultValue;
            const word = content.split(' ').slice(arg.index).join(' ') || def;

            args[arg.id] = this._processType(arg, word, message);
        }

        return args;
    }

    _processType(arg, word, message){
        const def = typeof arg.defaultValue === 'function' ? arg.defaultValue.call(this, message) : arg.defaultValue;

        const typeFunc = {
            [ArgumentTypes.STRING]: () => word || def,
            [ArgumentTypes.NUMBER]: () => {
                if (isNaN(word) || !word) return def;
                return parseFloat(word);
            },
            [ArgumentTypes.INTEGER]: () => {
                if (isNaN(word) || !word) return def;
                return parseInt(word);
            },
            [ArgumentTypes.DYNAMIC]: () => {
                if (!word) return def;
                if (isNaN(word)) return word;
                return parseFloat(word);
            },
            [ArgumentTypes.DYNAMIC_INT]: () => {
                if (!word) return def;
                if (isNaN(word)) return word;
                return parseInt(word);
            },
            [ArgumentTypes.USER]: () => {
                const res = val => this.client.util.resolveUser(val, false, true);
                if (!word) return res(def);
                return res(word) || res(def);
            },
            [ArgumentTypes.MEMBER]: () => {
                const res = val => this.client.util.resolveMember(val, message.guild, false, true);
                if (!word) return res(def);
                return res(word) || res(def);
            },
            [ArgumentTypes.CHANNEL]: () => {
                const res = val => this.client.util.resolveChannel(val, message.guild, false, true);
                if (!word) return res(def);
                return res(word) || res(def);
            },
            [ArgumentTypes.TEXT_CHANNEL]: () => {
                const res = val => this.client.util.resolveChannel(val, message.guild, false, true);
                if (!word) return res(def);

                const channel = res(word);
                if (!channel || channel.type !== 'text') return res(def);

                return channel;
            },
            [ArgumentTypes.VOICE_CHANNEL]: () => {
                const res = val => this.client.util.resolveChannel(val, message.guild, false, true);
                if (!word) return res(def);

                const channel = res(word);
                if (!channel || channel.type !== 'voice') return res(def);

                return channel;
            },
            [ArgumentTypes.ROLE]: () => {
                const res = val => this.client.util.resolveRole(val, message.guild, false, true);
                if (!word) return res(def);
                return res(word) || res(def);
            },
            [ArgumentTypes.EMOJI]: () => {
                const res = val => this.client.util.resolveEmoji(val, message.guild, false, true);
                if (!word) return res(def);
                return res(word) || res(def);
            }
        };

        if (Array.isArray(arg.type)){
            if (!arg.type.some(t => t.toLowerCase() === word.toLowerCase())){
                return def;
            }
            
            return word.toLowerCase();
        }

        if (typeof arg.type === 'function'){
            const res = arg.type.call(this, word, message);
            if (res === true) return word;
            if (!res) return def;

            return res;
        }

        if (typeFunc[arg.type]) return typeFunc[arg.type]();
        return word || def;
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

    /**
     * Disables the command.
     * @method
     * @name Command#disable
     * @returns {boolean}
     */
}

module.exports = Command;
