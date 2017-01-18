/**
 * An argument in a command.
 * @typedef {Object} Argument
 * @prop {string} id - ID of the argument.
 * @prop {ArgumentMatch} [match='word'] - Method to match argument.
 * @prop {ArgumentType} [type='string'] - Attempts to cast argument to this type.
 * @prop {string|string[]} [prefix] - Ignores word order and uses a word that starts with/matches this prefix (or multiple prefixes if array). Applicable to 'prefix' and 'flag' only.
 * @prop {number} [index] - Word to start from. Applicable to 'word', 'text', or 'content' only. When using with word, this will offset all word arguments after it by 1 unless the index property is also specified for them.
 * @prop {(string|number)} [defaultValue=''] - Default value if a word is not inputted or a type could not be casted to.
 * @prop {string} [description=''] - A description of the argument.
 */

/**
 * The method to match arguments from text. Possible strings are:
 * <br/><code>'word'</code> Matches by the order of the words inputted. Ignores words that matches prefix or flag.
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
 * <br/>An array of strings can be used to restrict input to only those strings, case insensitive. The evaluated argument will be all lowercase.
 * <br/>A function (<code>arg => {}</code>) can also be used to filter arguments.
 * <br/>If the input is not in the array or does not pass the function, the default value is used.
 * @typedef {string|string[]} ArgumentType
 */

/**
 * Options to use for command execution behavior.
 * @typedef {Object} CommandOptions
 * @prop {string} [category=''] - Command category for organization purposes.
 * @prop {string} [description=''] - Description of the command.
 * @prop {boolean} [ownerOnly=false] - Allow client owner only.
 * @prop {string} [channelRestriction='none'] - Restricts channel: 'guild' or 'dm'.
 * @prop {ArgumentSplit} [split='plain'] - Method to split text into words.
 */

/**
 * The method to split text into words. Possible strings are:
 * <br/><code>'plain'</code> Splits word separated by whitespace. Extra whitespace is ignored.
 * <br/><code>'split'</code> Splits word separated by whitespace.
 * <br/><code>'quoted'</code> This is like plain, but counts text inside double quotes as one word.
 * <br/><code>'sticky'</code> This is like quoted, but makes it so that quoted text must have a whitespace/another double quote before it to count as another word.
 * @typedef {string} ArgumentSplit
 */

class Command {
    /**
     * Creates a new Command.
     * @param {string} id - Command ID.
     * @param {string[]} aliases - Names to call the command with.
     * @param {Argument[]} args - Arguments for the command.
     * @param {function} exec - Function (<code>(message, args) => {}</code>) called when command is ran.
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
            if (arg.match === undefined) arg.match = 'word';
            if (arg.type === undefined) arg.type = 'string';
            if (arg.defaultValue === undefined) arg.defaultValue = '';

            if (Array.isArray(arg.description)) arg.description = arg.description.join('\n');
            if (arg.description === undefined) arg.description = '';
        });

        /**
         * Function called for command.
         * @type {function}
         */
        this.exec = exec;

        /**
         * Options for the command. Note that you can define any value here that you want for your own use.
         * @type {CommandOptions}
         */
        this.options = options;
        if (this.options.category === undefined) this.options.category = '';

        if (Array.isArray(this.options.description)) this.options.description = this.options.description.join('\n');
        if (this.options.description === undefined) this.options.description = '';
        
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
            quoted: content.match(/".*?"|[^\s"]+|"/g),
            sticky: content.match(/[^\s"]*?".*?"|[^\s"]+|"/g)
        };
        
        words = argSplit[this.options.split] || [];

        let args = {};

        let wordArgs = this.args.filter(arg => arg.match === 'word');
        let prefixArgs = this.args.filter(arg => arg.match === 'prefix');
        let flagArgs = this.args.filter(arg => arg.match === 'flag');
        let textArgs = this.args.filter(arg => arg.match === 'text');
        let contentArgs = this.args.filter(arg => arg.match === 'content');

        let prefixes = [];
        [...prefixArgs, ...flagArgs].forEach(arg => {
            Array.isArray(arg.prefix) ? prefixes.push(...arg.prefix) : prefixes.push(arg.prefix);
        });

        let noPrefixWords = words.filter(w => !prefixes.some(p => w.startsWith(p))); 

        let processType = (arg, word) => {
            if (isNaN(word) && (arg.type === 'number' || arg.type === 'integer')){
                word = arg.defaultValue;
            } else
            if (arg.type === 'dynamic' || arg.type === 'number'){
                word = parseFloat(word);
            } else
            if (arg.type === 'dynamicInt' || arg.type === 'integer'){
                word = parseInt(word);
            } else
            if (Array.isArray(arg.type)){
                if (!arg.type.some(t => t.toLowerCase() === word.toLowerCase())){
                    word = arg.defaultValue;
                } else {
                    word = word.toLowerCase();
                }
            } else 
            if (typeof arg.type === 'function'){
                if (!arg.type(word)) word = arg.defaultValue;
            }

            return word;
        };

        wordArgs.forEach((arg, i) => {
            let word = noPrefixWords[arg.index !== undefined ? arg.index : i];
            if (!word) return args[arg.id] = arg.defaultValue;
            
            if ((this.options.split === 'quoted' || this.options.split === 'sticky') && /^".*"$/.test(word)) word = word.slice(1, -1);
            args[arg.id] = processType(word);
        });

        words.reverse();

        prefixArgs.forEach(arg => {
            let word = words.find(w => Array.isArray(arg.prefix) ? arg.prefix.some(p => w.startsWith(p)) : w.startsWith(arg.prefix));
            if (!word) return args[arg.id] = arg.defaultValue;

            word = word.replace(prefixes.find(p => word.startsWith(p)), '');
            args[arg.id] = processType(word);
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