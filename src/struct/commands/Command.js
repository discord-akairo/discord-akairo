const { ArgumentMatches, ArgumentTypes, ArgumentSplits } = require('../utils/Constants');

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
 * The method to match arguments from text. Possible strings are:
 * <br/><code>'word'</code> Matches by the order of the words inputted. Ignores words that matches prefix or flag.
 * <br/><code>'rest'</code> Matches the rest of the words in order. Ignores words that matches prefix or flag.
 * <br/><code>'prefix'</code> Matches words that starts with the prefix. The word after the prefix is the evaluated argument.
 * <br/><code>'flag'</code> Matches words that equal this prefix. The evaluated argument is true or false.
 * <br/><code>'text'</code> Matches the entire text, except for the command, ignoring words that matches prefix or flag.
 * <br/><code>'content'</code> Matches the entire text as it was inputted, except for the command.
 * @typedef {string} ArgumentMatch
 */

/**
 * The type that the argument should be cast to. Possible strings are:
 * <br/><code>'string'</code> Does not cast to any type.
 * <br/><code>'number'</code> Casts to an number with parseFloat(), default value if not a number.
 * <br/><code>'integer'</code> Casts to an integer with parseInt(), default value if not a number.
 * <br/><code>'dynamic'</code> Casts to a number with parseFloat() or a string if the argument is not a number.
 * <br/><code>'dynamicInt'</code> Casts to an integer with parseInt() or a string if the argument is not a number.
 * <br/>
 * <br/>Possible Discord-related strings:
 * <br/><code>'user'</code> Tries to resolve to a user.
 * <br/><code>'member'</code> Tries to resolve to a member.
 * <br/><code>'channel'</code> Tries to resolve to a channel.
 * <br/><code>'textChannel'</code> Tries to resolve to a text channel.
 * <br/><code>'voiceChannel'</code> Tries to resolve to a voice channel.
 * <br/><code>'role'</code> Tries to resolve to a role.
 * <br/>If any of the above are not valid, the default value will be resolved (recommended to use an ID).
 * <br/>
 * <br/>An array of strings can be used to restrict input to only those strings, case insensitive.
 * <br/>The evaluated argument will be all lowercase.
 * <br/>If the input is not in the array, the default value is used.
 * <br/>
 * <br/>A function <code>((word, message) => {})</code> can also be used to filter or modify arguments.
 * <br/>A return value of true will let the word pass, a falsey return value will use the default value for the argument.
 * <br/>Any other truthy return value will be used as the argument.
 * @typedef {string} ArgumentType
 */

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {Argument[]} [args=[]] - Arguments to parse.
 * @prop {string} [aliases=[]] - Command names.
 * @prop {string} [category='default'] - Category ID for organization purposes.
 * @prop {string|string[]} [description=''] - Description of the command.
 * @prop {boolean} [ownerOnly=false] - Allow client owner only.
 * @prop {string} [channelRestriction='none'] - Restricts channel: 'guild' or 'dm'.
 * @prop {ArgumentSplit} [split='plain'] - Method to split text into words.
 * @prop {Object} [custom={}] - An object for custom options. Accessible with command.options.
 */

/**
 * The method to split text into words. Possible strings are:
 * <br/><code>'plain'</code> Splits word separated by whitespace. Extra whitespace is ignored.
 * <br/><code>'split'</code> Splits word separated by whitespace.
 * <br/><code>'quoted'</code> This is like plain, but counts text inside double quotes as one word.
 * <br/><code>'sticky'</code> This is like quoted, but makes it so that quoted text must have a whitespace/another double quote before it to count as another word. It will still span multiple words.
 * @typedef {string} ArgumentSplit
 */

class Command {
    /**
     * Creates a new command.
     * @param {string} id - Command ID.
     * @param {function} exec - Function <code>((message, args) => {})</code> called when command is ran.
     * @param {CommandOptions} [options={}] - Options for the command.
     */
    constructor(id, exec, options = {}){
        /**
         * ID of the command.
         * @type {string}
         */
        this.id = id;

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
        this.args.forEach(arg => {
            if (!arg.match) arg.match = ArgumentMatches.WORD;
            if (!arg.type) arg.type = ArgumentTypes.STRING;
            if (!arg.defaultValue) arg.defaultValue = '';

            if (Array.isArray(arg.description)) arg.description = arg.description.join('\n');
            if (!arg.description) arg.description = '';
        });

        /**
         * Category this command belongs to.
         * @type {Category}
         */
        this.category = options.category || 'default';

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
        this.options = options.custom || {};

        /**
         * Function called for command.
         * @type {function}
         */
        this.exec = exec;

        /**
         * Whether or not this command is enabled.
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * Path to command file.
         * @readonly
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Akairo client.
         * @readonly
         * @type {AkairoClient}
         */
        this.client = null;

        /**
         * The command handler.
         * @readonly
         * @type {CommandHandler}
         */
        this.commandHandler = null;
    }

    /**
     * Reloads the command.
     */
    reload(){
        this.commandHandler.reload(this.id);
    }

    /**
     * Removes the command. It can be readded with the command handler.
     */
    remove(){
        this.commandHandler.remove(this.id);
    }

    /**
     * Enables the command.
     */
    enable(){
        if (this.enabled) return;
        this.enabled = true;
    }

    /**
     * Disables the command.
     */
    disable(){
        if (!this.enabled) return;
        this.enabled = false;
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

        const words = splitFunc[this.split] ? splitFunc[this.split]() || [] : [];
        const args = {};

        const wordArgs = this.args.filter(arg => arg.match === ArgumentMatches.WORD || arg.match === ArgumentMatches.REST);
        const prefixArgs = this.args.filter(arg => arg.match === ArgumentMatches.PREFIX);
        const flagArgs = this.args.filter(arg => arg.match === ArgumentMatches.FLAG);
        const textArgs = this.args.filter(arg => arg.match === ArgumentMatches.TEXT);
        const contentArgs = this.args.filter(arg => arg.match === ArgumentMatches.CONTENT);

        const prefixes = [];
        [...prefixArgs, ...flagArgs].forEach(arg => {
            Array.isArray(arg.prefix) ? prefixes.push(...arg.prefix) : prefixes.push(arg.prefix);
        });

        const noPrefixWords = words.filter(w => !prefixes.some(p => w.startsWith(p)));

        const processType = (arg, word) => {
            const def = typeof arg.defaultValue === 'function' ? arg.defaultValue(message) : arg.defaultValue;

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
                const res = arg.type(word, message);
                if (res === true) return word;
                if (!res) return def;

                return res;
            }

            if (typeFunc[arg.type]) return typeFunc[arg.type]();
            return word || def;
        };

        wordArgs.forEach((arg, i) => {
            let word;

            if (arg.match === ArgumentMatches.REST){
                word = noPrefixWords.slice(arg.index !== undefined ? arg.index : i).join(' ') || '';
            } else {
                word = noPrefixWords[arg.index !== undefined ? arg.index : i] || '';
            }

            if ((this.split === ArgumentSplits.QUOTED || this.split === ArgumentSplits.STICKY) && /^".*"$/.test(word)) word = word.slice(1, -1);

            args[arg.id] = processType(arg, word);
        });

        words.reverse();

        prefixArgs.forEach(arg => {
            let word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w.startsWith(p)) : w.startsWith(arg.prefix)) || '';
            word = word.replace(prefixes.find(p => word.startsWith(p)), '');
            
            if (this.split === ArgumentSplits.STICKY && /^".*"$/.test(word)) word = word.slice(1, -1);

            args[arg.id] = processType(arg, word);
        });

        flagArgs.forEach(arg => {
            const word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w === p) : w === arg.prefix);
            return args[arg.id] = !!word;
        });

        textArgs.forEach(arg => {
            const def = typeof arg.defaultValue === 'function' ? arg.defaultValue(message) : arg.defaultValue;
            const w = noPrefixWords.slice(arg.index).join(' ') || def;

            args[arg.id] = processType(arg, w);
        });

        contentArgs.forEach(arg => {
            const def = typeof arg.defaultValue === 'function' ? arg.defaultValue(message) : arg.defaultValue;
            const w = content.split(' ').slice(arg.index).join(' ') || def;

            args[arg.id] = processType(arg, w);
        });

        return args;
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString(){
        return this.id;
    }
}

module.exports = Command;
