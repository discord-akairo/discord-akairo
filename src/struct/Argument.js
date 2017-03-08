const { ArgumentMatches, ArgumentTypes } = require('../util/Constants');

/**
 * The method to match arguments from text.
 * <br><code>word</code> matches by the order of the words inputted, ignoring words that matches prefix or flag.
 * <br><code>rest</code> matches the rest of the words in order, ignoring words that matches prefix or flag.
 * <br><code>prefix</code> matches words that starts with the prefix. The word after the prefix is the evaluated argument.
 * <br><code>flag</code> matches words that equal this prefix. The evaluated argument is true or false.
 * <br><code>text</code> matches the entire text, except for the command, ignoring words that matches prefix or flag.
 * <br><code>content</code> matches the entire text as it was inputted, except for the command.
 * @typedef {string} ArgumentMatch
 */

/**
 * The type that the argument should be cast to.
 * <br><code>string</code> does not cast to any type.
 * <br><code>number</code> casts to an number with parseFloat(), default value if not a number.
 * <br><code>integer</code> casts to an integer with parseInt(), default value if not a number.
 * <br><code>dynamic</code> casts to a number with parseFloat() or a string if the argument is not a number.
 * <br><code>dynamicInt</code> casts to an integer with parseInt() or a string if the argument is not a number.
 * <br>
 * <br>Possible Discord-related types:
 * <br><code>user</code> tries to resolve to a user.
 * <br><code>member</code> tries to resolve to a member.
 * <br><code>relevant</code> tries to resolve to a relevant user in both guilds and DMs.
 * <br><code>channel</code> tries to resolve to a channel.
 * <br><code>textChannel</code> tries to resolve to a text channel.
 * <br><code>voiceChannel</code> tries to resolve to a voice channel.
 * <br><code>role</code> tries to resolve to a role.
 * <br><code>emoji</code> tries to resolve to a custom emoji.
 * <br><code>guild</code> tries to resolve to a guild.
 * <br>
 * <br>Many of these types can only be used in a guild.
 * <br>You can also pluralize the type to get a Collection of resolved objects instead.
 * <br>If any (except relevant) of the above are invalid, the default value will be resolved.
 * <br>
 * <br>An array of strings can be used to restrict input to only those strings, case insensitive.
 * <br>The evaluated argument will be all lowercase.
 * <br>If the input is not in the array, the default value is used.
 * <br>
 * <br>A function <code>((word, message) => {})</code> can also be used to filter or modify arguments.
 * <br>A return value of true will let the word pass, a falsey return value will use the default value for the argument.
 * <br>Any other truthy return value will be used as the argument.
 * @typedef {string|string[]} ArgumentType
 */

/**
 * A prompt to run if the user did not input the argument correctly.
 * <br>Can only be used if there is not a default value.
 * @prop {PromptFunctions} on - Functions called in prompts.
 * @prop {number} [retries=1] - Amount of times to retries.
 * @prop {number} [time=30000] - Time to wait for input.
 * @typedef {Object} PromptOptions
 */

/**
 * Functions <code>(message => {})</code> called at various stages in a prompt to use as the text.
 * <br>Defaults can be set at AkairoOptions in defaultPrompts.
 * @typedef {Object} PromptFunctions
 * @prop {function} [start] - Called on start.
 * @prop {function} [retry] - Called on a retry.
 * @prop {function} [time] - Called on collector time out.
 * @prop {function} [end] - Called on no retries left.
 * @prop {function} [cancel] - Called on cancel.
 */

/**
 * Options for how an argument parses text.
 * @typedef ArgumentOptions
 * @prop {string} id - ID of the argument for use in the args object.
 * @prop {ArgumentMatch} [match='word'] - Method to match text.
 * @prop {ArgumentType} [type='string'] - Type to cast to.
 * @prop {string|string[]} [prefix] - The string(s) to use as the flag for prefix and flag args.
 * @prop {number} [index] - Index/word of text to start from.<br>Applicable to word, text, or content match only.
 * @prop {any} [default=''] - Default value if text does not parse/cast correctly.<br>Can be a function <code>(message => {})</code>.
 * @prop {string|string[]} [description=''] - A description of the argument.
 * @prop {PromptOptions} [prompt] - Prompt options for when user does not provide input.<br>Must not have a default value for this to work.
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
         * The prompt options.
         * @type {PromptOptions}
         */
        this.prompt = options.prompt;

        /**
         * The default value.
         * @method
         * @name Argument#default
         * @param {Message} - The message that called the command.
         * @returns {any}
         */
        this.default = typeof options.default === 'function' ? options.default : () => options.default;
    }

    /**
     * Casts the type of this argument onto a word.
     * @param {string} word - The word to cast.
     * @param {Message} message - The message that called the command.
     * @returns {Promise.<any>}
     */
    cast(word, message){
        const res = this._processType(word, message);
        return res != null ? Promise.resolve(res) : this.prompt ? this._promptArgument(message) : Promise.resolve(null);
    }

    _processType(word, message){
        if (Array.isArray(this.type)){
            if (!this.type.some(t => t.toLowerCase() === word.toLowerCase())){
                const def = this.default.call(this.command, message);
                return def != null ? def : null;
            }
            
            return word.toLowerCase();
        }

        if (typeof this.type === 'function'){
            const res = this.type.call(this.command, word, message);
            if (res === true) return word;
            if (res != null) return res;

            const def = this.default.call(this.command, message);
            return def != null ? def : null;
        }

        if (this.command.handler.resolver[this.type]){
            const res = this.command.handler.resolver[this.type](word, message);
            if (res != null) return res;

            const def = this.default.call(this.command, message);
            return def != null ? def : null;
        }

        if (word) return word;

        const def = this.default.call(this.command, message);
        return def != null ? def : null;
    }

    _promptArgument(message){
        const prompt = Object.assign({}, this.prompt || {});
        prompt.on = {};
        
        Object.assign(prompt.on, this.command.handler.defaultPrompts);
        Object.assign(prompt.on, this.command.defaultPrompts);
        Object.assign(prompt.on, this.prompt && this.prompt.on || {});

        const retry = i => {
            this.command.handler.prompts.add(message.author.id + message.channel.id);
            const text = i === 1 ? prompt.on.start.call(this, message) : prompt.on.retry.call(this, message);

            let value;

            return this.command.client.util.prompt(message, text, m => {
                if (m.content.toLowerCase() === this.command.handler.cancelWord.toLowerCase()) throw 'cancel';

                const res = this._processType(m.content, m);
                value = res;
                return res;
            }, this.prompt && this.prompt.time || 30000).then(() => value).catch(reason => {
                if (reason instanceof Error){
                    this.command.handler.prompts.delete(message.author.id + message.channel.id);
                    throw reason;
                }

                if (reason === 'time') return message.channel.send(prompt.on.time.call(this, message)).then(() => {
                    this.command.handler.prompts.delete(message.author.id + message.channel.id);
                    throw 'time';
                });

                if (reason === 'cancel') return message.channel.send(prompt.on.cancel.call(this, message)).then(() => {
                    this.command.handler.prompts.delete(message.author.id + message.channel.id);
                    throw 'cancel';
                });
                
                return i > (this.prompt && this.prompt.retries || this.command.handler.defaultRetries) ? message.channel.send(prompt.on.end.call(this, message)).then(() => {
                    this.command.handler.prompts.delete(message.author.id + message.channel.id);
                    throw 'end';
                }) : retry(i + 1);
            });
        };

        return retry(1).then(value => {
            this.command.handler.prompts.delete(message.author.id + message.channel.id);
            return value;
        });
    }
}

module.exports = Argument;
