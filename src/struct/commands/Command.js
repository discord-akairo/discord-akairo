/**
 * @typedef {Object} Argument
 * An argument in a command.
 * @prop {string} id - ID of the argument.
 * @prop {string} prefix - Ignores word order and uses a word that starts with this prefix.
 * @prop {string} parse - Method to parse argument: 'word', 'prefix', 'flag', or 'text'.
 * @prop {string} type - Attempts to cast input to this type: 'string', 'number', or 'dynamic'. 
 * @prop {(string|number)} defaultValue - Default value if a word is not inputted.
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
     * @param {function} exec Function called when command is ran. (message, args, content)
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
         * @type {?string}
         */
        this.filepath;

        /**
         * The Akairo framework.
         * @type {?Framework}
         */
        this.framework;

        /**
         * The command handler.
         * @type {?CommandHandler}
         */
        this.commandHandler;
    }

    /**
     * Gets an example of the command using all arguments or one text argument.
     * @type {string}
     */
    get example(){
        if (this.args.length === 1 && this.args[0].parse === 'text'){
            return `${this.aliases[0]} ${this.args[0].id}`;
        }

        let args = this.args.filter(arg => arg.parse !== 'text').map(arg => {
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
}

module.exports = Command;