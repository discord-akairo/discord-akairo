/**
 * An argument in a command.
 * @typedef {Object} Argument
 * @prop {string} id - ID of the argument.
 * @prop {string} [parse='word'] - Method to parse argument: 'word', 'prefix', 'flag', 'text', or 'content'. Word parses by the order of the words inputted. Prefix and flag ignores order and uses the value after the prefix (if prefix) or true/false (if flag). Text and content retrieves everything after the command, with the difference being that text ignores prefixes. Note that if the command's split type is plain or quote, text will also not have extra whitespace.
 * @prop {(string|string[])} [type='string'] - Attempts to cast input to this type: 'string', 'number', 'integer', or 'dynamic'. String does not care about type. Number and integer attempts to parse the input to a number or an integer and if it is NaN, it will use the default value. Dynamic defaults to a string, but will parse to number if it is not NaN. An array can be used to only allow those inputs (case-insensitive strings).
 * @prop {(string|string[])} [prefix] - Ignores word order and uses a word that starts with/matches this prefix (or multiple prefixes if array). Applicable to 'prefix' and 'flag' only.
 * @prop {number} [index] - Word to start from. Applicable to 'word', 'text', or 'content' only. When using with word, this will offset all word arguments after it by 1 unless the index property is also specified for them.
 * @prop {(string|number)} [defaultValue=''] - Default value if a word is not inputted.
 */

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string} [category=''] - Command category for organization purposes.
 * @prop {boolean} [ownerOnly=false] - Allow client owner only.
 * @prop {string} [channelRestriction='none'] - Restricts channel: 'guild' or 'dm'.
 * @prop {string} [split='plain'] - Method to divide text into words: 'plain', 'split', or 'quoted'. Plain splits by space and ignores extra whitespace between words, while split is just split(' '). Quoted does the same as plain, but counts text in double quotes as one word.
 */

class Command {
    /**
     * Creates a new Command.
     * @param {string} id - Command ID.
     * @param {string[]} aliases - Names to call the command with.
     * @param {Argument[]} args - Arguments for the command.
     * @param {function} exec - Function called when command is ran. (message, args)
     * @param {CommandOptions} options - Options for the command.
     */
    constructor(id, aliases = [], args = [], exec, options = {}){
        /**
         * ID of the Command.
         * @type {string}
         */
        this.id = id;

        /**
         * Command names.
         * @type {string[]}
         */
        this.aliases = aliases;

        /**
         * Arguments for the command.
         * @type {Argument[]}
         */
        this.args = args;
        this.args.forEach(arg => {
            if (arg.parse === undefined) arg.parse = 'word';
            if (arg.type === undefined) arg.type = 'string';
            if (arg.defaultValue === undefined) arg.defaultValue = '';
        });

        /**
         * Function called for command.
         * @type {function}
         */
        this.exec = exec;

        /**
         * CommandOptions.
         * @type {CommandOptions}
         */
        this.options = options;
        if (this.options.category === undefined) this.options.category = '';
        if (this.options.ownerOnly === undefined) this.options.ownerOnly = false;
        if (this.options.channelRestriction === undefined) this.options.channelRestriction = 'none';
        if (this.options.split === undefined) this.options.split = 'plain';

        /**
         * Path to Command file.
         * @readonly
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Akairo framework.
         * @readonly
         * @type {Framework}
         */
        this.framework = null;

        /** 
         * The Discord.js client. 
         * @readonly
         * @type {Client}
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
     * Shortcut to format(). Formats the arguments.
     * @type {string}
     */
    get example(){
        return this.format();
    }

    /** 
     * Formats the arguments.
     * @param {string[]} [ignore=[]] - Ignores the specified argument IDs.
     * @param {boolean} [whitelist=false] - Uses the ignore param as a whitelist instead of a blacklist.
     */
    format(ignore = [], whitelist = false){
        let args = this.args.filter(arg => whitelist ? ignore.includes(arg.id) : !ignore.includes(arg.id));

        args = args.map(arg => {
            if (arg.parse === 'flag') return arg.prefix;
            if (arg.parse === 'prefix') return `${arg.prefix}${arg.id}`;
            if (arg.parse === 'text' || arg.parse === 'content') return `${arg.id}...`;
            return arg.id;
        });

        return `${this.aliases[0]} ${args.join(' ')}`;
    }

    /**
     * Reloads the Command.
     */
    reload(){
        this.commandHandler.reloadCommand(this.id);
    }

    /**
     * Removes the Command. It can be readded with the command handler.
     */
    remove(){
        this.commandHandler.removeCommand(this.id);
    }

    /**
     * Parses text based on this Command's args.
     * @param {string} content - String to parse.
     * @returns {Object}
     */
    parse(content){
        let words = [];
        const argSplit = {
            plain: content.match(/[^\s]+/g),
            split: content.split(' '),
            quoted: content.match(/".*?"|[^\s"]+|"/g)
        };
        
        words = argSplit[this.options.split] || [];

        let args = {};

        let wordArgs = this.args.filter(arg => arg.parse === 'word');
        let prefixArgs = this.args.filter(arg => arg.parse === 'prefix');
        let flagArgs = this.args.filter(arg => arg.parse === 'flag');
        let textArgs = this.args.filter(arg => arg.parse === 'text');
        let contentArgs = this.args.filter(arg => arg.parse === 'content');

        let prefixes = prefixArgs.concat(flagArgs).reduce((res, cur) => Array.isArray(cur.prefix) ? res.push(...cur.prefix) : res.push(cur.prefix), []);
        let noPrefixWords = words.filter(w => !prefixes.some(p => w.startsWith(p))); 

        wordArgs.forEach((arg, i) => {
            let word = noPrefixWords[arg.index !== undefined ? arg.index : i];
            if (!word) return args[arg.id] = arg.defaultValue;

            if (this.options.split === 'quoted' && /^".*"$/.test(word)) word = word.slice(1, -1);

            if (isNaN(word) && (arg.type === 'number' || arg.type === 'integer')){
                word = arg.defaultValue;
            } else
            if (arg.type === 'dynamic' || arg.type === 'number'){
                word = parseFloat(word);
            } else
            if (arg.type === 'integer'){
                word = parseInt(word);
            } else
            if (Array.isArray(arg.type)){
                if (!arg.type.map(t => t.toLowerCase()).includes(word.toLowerCase())) {
                    return word = arg.defaultValue;
                }

                word = word.toLowerCase();
            }

            args[arg.id] = word;
        });

        words.reverse();

        prefixArgs.forEach(arg => {
            let word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w.startsWith(p)) : w.startsWith(arg.prefix));
            if (!word) return args[arg.id] = arg.defaultValue;

            word = word.replace(arg.prefix, '');

            if (isNaN(word) && (arg.type === 'number' || arg.type === 'integer')){
                word = arg.defaultValue;
            } else
            if (arg.type === 'dynamic' || arg.type === 'number'){
                word = parseFloat(word);
            } else
            if (arg.type === 'integer'){
                word = parseInt(word);
            } else
            if (Array.isArray(arg.type)){
                if (!arg.type.map(t => t.toLowerCase()).includes(word.toLowerCase())) {
                    return word = arg.defaultValue;
                }

                word = word.toLowerCase();
            }

            args[arg.id] = word;
        });

        flagArgs.forEach(arg => {    
            let word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w === p) : w === arg.prefix);
            return args[arg.id] = !!word;
        });

        textArgs.forEach(arg => {
            args[arg.id] = noPrefixWords.slice(arg.index).join(' ') || arg.defaultValue;
        });

        contentArgs.forEach(arg => {
            args[arg.id] = content.split(' ').slice(arg.index).join(' ') || arg.defaultValue;
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