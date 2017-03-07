const { ArgumentMatches, ArgumentTypes } = require('../util/Constants');

/**
 * The method to match arguments from text.
 * Possible matches are:
 * word: Matches by the order of the words inputted. Ignores words that matches prefix or flag.
 * rest: Matches the rest of the words in order. Ignores words that matches prefix or flag.
 * prefix: Matches words that starts with the prefix. The word after the prefix is the evaluated argument.
 * flag: Matches words that equal this prefix. The evaluated argument is true or false.
 * text: Matches the entire text, except for the command, ignoring words that matches prefix or flag.
 * content: Matches the entire text as it was inputted, except for the command.
 * @typedef {string} ArgumentMatch
 */

/**
 * The type that the argument should be cast to.
 * Possible basic types are:
 * string: Does not cast to any type.
 * number: Casts to an number with parseFloat(), default value if not a number.
 * integer: Casts to an integer with parseInt(), default value if not a number.
 * dynamic: Casts to a number with parseFloat() or a string if the argument is not a number.
 * dynamicInt: Casts to an integer with parseInt() or a string if the argument is not a number.
 * Possible Discord-related types:
 * user: Tries to resolve to a user.
 * member: Tries to resolve to a member.
 * relevant: Tries to resolve to a relevant user. Works in both guilds and DMs.
 * channel: Tries to resolve to a channel.
 * textChannel: Tries to resolve to a text channel.
 * voiceChannel: Tries to resolve to a voice channel.
 * role: Tries to resolve to a role.
 * emoji: Tries to resolve to a custom emoji.
 * guild: Tries to resolve to a guild.
 * Many of these types can only be used in a guild.
 * You can also pluralize the type to get a Collection of resolved objects instead.
 * If any (except relevant) of the above are invalid, the default value will be resolved.
 * An array of strings can be used to restrict input to only those strings, case insensitive.
 * The evaluated argument will be all lowercase.
 * If the input is not in the array, the default value is used.
 * A function ((word, message) => {}) can also be used to filter or modify arguments.
 * A return value of true will let the word pass, a falsey return value will use the default value for the argument.
 * Any other truthy return value will be used as the argument.
 * @typedef {string|string[]} ArgumentType
 */

/**
 * Options for how an argument parses text.
 * @typedef ArgumentOptions
 * @prop {string} id - ID of the argument for use in the args object.
 * @prop {ArgumentMatch} [match='word'] - Method to match text.
 * @prop {ArgumentType} [type='string'] - Type to cast to.
 * @prop {string|string[]} [prefix] - The string(s) to use as the flag for prefix and flag args.
 * @prop {number} [index] - Index/word of text to start from. Applicable to word, text, or content match only.
 * @prop {*} [default=''] - Default value if text does not parse/cast correctly. Can be a function (message => {}).
 * @prop {string|string[]} [description=''] - A description of the argument.
 */

class Argument {
    /**
     * An argument for a command.
     * @param {Command} command - Command of the argument.
     * @param {ArgumentOptions} options - Options for the argument.
     */
    constructor(command, options = {}){
        /**
         * The ID of the argument.
         * @type {string}
         */
        this.id = options.id;

        /**
         * The command this argument belongs to.
         * @type {Command}
         */
        this.command = command;

        /**
         * The method to match text.
         * @type {ArgumentMatch}
         */
        this.match = options.match || ArgumentMatches.WORD;

        /**
         * The type to cast to.
         * @type {ArgumentType}
         */
        this.type = options.type || ArgumentTypes.STRING;

        /**
         * The prefix to use for flag or prefix args.
         * @type {?string}
         */
        this.prefix = options.prefix;

        /**
         * The index to skip to.
         * @type {?number}
         */
        this.index = options.index;

        /**
         * The description.
         * @type {string}
         */
        this.description = Array.isArray(options.description) ? options.description.join('\n') : options.description || '';

        /**
         * The default value.
         * @method
         * @name Argument#default
         * @param {Message} - The message that called the command.
         * @returns {*}
         */
        this.default = typeof options.default === 'function' ? options.default : () => options.default;
    }

    /**
     * Process types of this argument from a word.
     * @param {string} word - The word to cast.
     * @param {Message} message - The message that called the command.
     */
    processType(word, message){
        const def = this.default.call(this.command, message);

        if (Array.isArray(this.type)){
            if (!this.type.some(t => t.toLowerCase() === word.toLowerCase())){
                return def;
            }
            
            return word.toLowerCase();
        }

        if (typeof this.type === 'function'){
            const res = this.type.call(this.command, word, message);
            if (res === true) return word;
            if (!res) return def;

            return res;
        }

        if (this.command.handler.resolver[this.type]){
            return this.command.handler.resolver[this.type](word, def, message);
        }

        return word || def;
    }
}

module.exports = Argument;
