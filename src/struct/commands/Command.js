/**
 * @typedef {Object} Argument
 * An argument in a command.
 * @prop {string} id - ID of the argument.
 * @prop {string} parse - Method to parse argument: 'word', 'prefix', 'flag', 'text', or 'content'.
 * @prop {string} type - Attempts to cast input to this type: 'string', 'number', or 'dynamic'. 
* @prop {string} prefix - Ignores word order and uses a word that starts with this prefix. Applicable to 'prefix' and 'flag' only.
 * @prop {number} index - Word to start from. Applicable to 'word', 'text', or 'content' only.
 * @prop {(string|number)} defaultValue - Default value if a word is not inputted.
 */

/**
 * @typedef {Object} EvaluatedArguments
 * Arguments parsed from text. Properties are determined by the command's args.
 */

/**
 * @typedef {Object} CommandOptions
 * Options to use for command execution behavior.
 * @prop {boolean} ownerOnly - Allow client owner only.
 * @prop {string} channelRestriction - Restricts channel: 'guild' or 'dm'.
 * @prop {string} split - Method to divide text into words: 'plain' or 'quoted'.
 */

class Command {
    /**
     * Creates a new Command.
     * @param {string} id Command ID.
     * @param {Array.<string>} aliases Names to call the command with.
     * @param {Array.<Argument>} args Arguments for the command.
     * @param {function} exec Function called when command is ran. (message, args)
     * @param {CommandOptions} options Options for the command.
     */
    constructor(id, aliases = [], args = [], exec, options = {}){
        /**
         * ID of the Command.
         * @type {string}
         */
        this.id = id;

        /**
         * Command names.
         * @type {Array.<string>}
         */
        this.aliases = aliases;

        /**
         * Arguments for the command.
         * @type {Array.<Argument>}
         */
        this.args = args;
        this.args.forEach(arg => {
            if (arg.parse === undefined) arg.parse = 'word';
            if (arg.type === undefined) arg.type = 'string';
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
        if (this.options.ownerOnly === undefined) this.options.ownerOnly = false;
        if (this.options.channelRestriction === undefined) this.options.channelRestriction = 'none';
        if (this.options.split === undefined) this.options.split = 'plain';

        /**
         * Path to Command file.
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Akairo framework.
         * @type {Framework}
         */
        this.framework = null;

        /**
         * The command handler.
         * @type {CommandHandler}
         */
        this.commandHandler = null;
    }

    /**
     * Gets an example of the command using all arguments or one text argument.
     * @type {string}
     */
    get example(){
        if (this.args.length === 1 && (this.args[0].parse === 'text' || this.args[0].parse === 'content')){
            return `${this.aliases[0]} ${this.args[0].id}`;
        }

        let args = this.args.filter(arg => arg.parse !== 'text' && arg.parse !== 'content').map(arg => {
            if (arg.parse === 'flag') return arg.prefix;
            if (arg.parse === 'prefix') return `${arg.prefix}${arg.id}`;
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
     * @param {string} content String to parse.
     * @returns {EvaluatedArguments}
     */
    parse(content){
        let words = [];
        const argSplit = {
            plain: content.match(/[^\s]+/g),
            quoted: content.match(/".*?"|[^\s"]+|"/g)
        };
        
        words = argSplit[this.options.split] || [];

        let args = {};

        let wordArgs = this.args.filter(arg => arg.parse === 'word');
        let prefixArgs = this.args.filter(arg => arg.parse === 'prefix');
        let flagArgs = this.args.filter(arg => arg.parse === 'flag');
        let textArgs = this.args.filter(arg => arg.parse === 'text');
        let contentArgs = this.args.filter(arg => arg.parse === 'content');

        let prefixes = prefixArgs.map(arg => arg.prefix);
        let noPrefixWords = words.filter(w => !prefixes.some(p => w.startsWith(p)));

        wordArgs.forEach((arg, i) => {
            let word = noPrefixWords[arg.index !== undefined ? arg.index : i];
            if (!word) return args[arg.id] = arg.defaultValue;

            if (this.options.split === 'quoted' && /^".*"$/.test(word)) word = word.slice(1, -1);

            if ((arg.type === 'dynamic' || arg.type === 'number') && !isNaN(word)) word = parseInt(word);
            if (arg.type === 'number' && isNaN(word)) word = arg.defaultValue;

            args[arg.id] = word;
        });

        words.reverse();

        prefixArgs.forEach(arg => {
            let word = words.find(w => w.startsWith(arg.prefix));
            if (!word) return args[arg.id] = arg.defaultValue;

            word = word.replace(arg.prefix, '');

            if ((arg.type === 'dynamic' || arg.type === 'number') && !isNaN(word)) word = parseInt(word);
            if (arg.type === 'number' && isNaN(word)) word = arg.defaultValue;

            args[arg.id] = word;
        });

        flagArgs.forEach(arg => {    
            let word = words.find(w => w === arg.prefix);
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
     * @override
     * @returns {string}
     */
    toString(){
        return this.id;
    }
}

module.exports = Command;