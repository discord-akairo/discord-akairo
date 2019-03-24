const { ArgumentMatches, ArgumentTypes } = require('../util/Constants');

/**
 * Represents an argument for a command.
 * @param {Command} command - Command of the argument.
 * @param {ArgumentOptions} options - Options for the argument.
 */
class Argument {
    constructor(command, options = {}) {
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
         * @type {?string | string[]}
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
         * @type {?ArgumentPromptOptions}
         */
        this.prompt = options.prompt;

        /**
         * The default value.
         * @method
         * @name Argument#default
         * @param {Message} message - The message that called the command.
         * @param {Object} args - Previous arguments from command.
         * @returns {any}
         */
        this.default = typeof options.default === 'function' ? options.default : () => options.default !== undefined ? options.default : '';
    }

    /**
     * The client.
     * @readonly
     * @type {AkairoClient}
     */
    get client() {
        return this.command.client;
    }

    /**
     * The command handler.
     * @readonly
     * @type {CommandHandler}
     */
    get handler() {
        return this.command.handler;
    }

    /**
     * Casts the type of this argument onto a word.
     * @param {string} word - The word to cast.
     * @param {Message} message - The message that called the command.
     * @param {Object} args - Previous arguments from command.
     * @returns {Promise<any>}
     */
    cast(word, message, args) {
        word = word.trim();

        if (!word && this.prompt && this.prompt.optional) {
            return Promise.resolve(this.default.call(this.command, message, args));
        }

        const res = this._processType(word, message, args);

        if (res != null) {
            return Promise.resolve(res).catch(err => {
                if (err instanceof Error) throw err;
                return this.prompt ? this._promptArgument(message, args) : this.default.call(this.command, message, args);
            });
        }

        if (this.prompt) return this._promptArgument(message, args);
        return Promise.resolve(this.default.call(this.command, message, args));
    }

    /**
     * Processes the type casting.
     * @private
     * @param {string} word - Word to process.
     * @param {Message} message - Message that called the command.
     * @param {Object} args - Previous arguments from command.
     * @returns {any}
     */
    _processType(word, message, args) {
        if (Array.isArray(this.type)) {
            for (const entry of this.type) {
                if (Array.isArray(entry)) {
                    if (entry.some(t => t.toLowerCase() === word.toLowerCase())) return entry[0];
                } else if (entry.toLowerCase() === word.toLowerCase()) {
                    return entry;
                }
            }

            return null;
        }

        if (typeof this.type === 'function') {
            const res = this.type.call(this.command, word, message, args);
            if (res === true) return word;
            if (res != null) return res;
            return null;
        }

        if (this.type instanceof RegExp) {
            const match = word.match(this.type);
            if (!match) return null;

            const groups = [];

            if (this.type.global) {
                let group;

                while ((group = this.type.exec(word)) != null) {
                    groups.push(group);
                }
            }

            return { match, groups };
        }

        if (this.handler.resolver[this.type]) {
            const res = this.handler.resolver[this.type](word, message, args);
            if (res != null) return res;
            return null;
        }

        if (word) return word;
        return null;
    }

    /**
     * Prompts a message for a word and casts it.
     * @private
     * @param {Message} message - Message to prompt.
     * @param {Object} args - Previous arguments from command.
     * @returns {Promise<any>}
     */
    _promptArgument(message, args) {
        const prompt = {};

        Object.assign(prompt, this.handler.defaultPrompt);
        Object.assign(prompt, this.command.defaultPrompt);
        Object.assign(prompt, this.prompt || {});

        let exited = false;
        let stopped = false;
        let value = prompt.infinite ? [] : null;
        if (prompt.infinite) args[this.id] = value;

        const retry = i => {
            this.handler.addPrompt(message);

            let text = i === 1 ? prompt.start : prompt.retry;

            text = typeof text === 'function'
                ? text.call(this, message, args, i)
                : `${message.author}, ${Array.isArray(text) ? text.join('\n') : text}`;

            text = Array.isArray(text) ? text.join('\n') : text;

            let opts;

            if (typeof text === 'object' && text.content) {
                opts = text;
                text = text.content;
            }

            return this.client.util.prompt(message, prompt.infinite && value.length && i === 1 ? '' : text, (m, s) => {
                if (s && this.handler.commandUtil) {
                    message.util.setLastResponse(s);
                }

                if (m.content.toLowerCase() === prompt.cancelWord.toLowerCase()) {
                    exited = true;
                    return false;
                }

                if (prompt.infinite && m.content.toLowerCase() === prompt.stopWord.toLowerCase()) {
                    if (value.length) stopped = true;
                    return false;
                }

                const res = this._processType(m.content, m, args);

                if (prompt.infinite) {
                    if (res != null) value.push(res);
                } else {
                    value = res;
                }

                return res;
            }, prompt.time, opts).then(() => {
                const limit = prompt.limit == null ? Infinity : prompt.limit;
                if (prompt.infinite && !stopped && value.length < limit) {
                    return retry(1);
                }

                if (this.handler.commandUtil) message.util.shouldEdit = false;
                return value;
            }).catch(reason => {
                if (reason instanceof Error) {
                    this.handler.removePrompt(message);
                    throw reason;
                }

                if (stopped) return value;

                let response;

                if (reason === 'time') response = prompt.timeout;
                if (reason === 'failed' && exited) response = prompt.cancel;
                if (i > prompt.retries) response = prompt.ended;

                if (response) exited = true;

                if (exited) {
                    response = typeof response === 'function'
                        ? response.call(this, message, args, i)
                        : `${message.author}, ${Array.isArray(response) ? response.join('\n') : response}`;

                    response = Array.isArray(response) ? response.join('\n') : response;
                    if (!response) return undefined;

                    if (typeof response === 'object' && response.content) {
                        return (message.util || message.channel).send(response.content, response);
                    }

                    return (message.util || message.channel).send(response);
                }

                return retry(i + 1);
            });
        };

        return retry(1).then(v => {
            this.handler.removePrompt(message);
            return exited ? Promise.reject() : v;
        });
    }
}

module.exports = Argument;

/**
 * Extra properties alongside the Discord.js message options type.
 * Available for use when returning in a prompt function or in CommandUtil.
 * @typedef {Object} MessageOptionsExtensions
 * @prop {string|string[]} [content] - Content to send.
 */

/**
 * The method to match arguments from text.
 * - `word` matches by the order of the words inputted.
 * It ignores words that matches a prefix or a flag.
 * - `rest` matches the rest of the words in order.
 * It ignores words that matches a prefix or a flag.
 * - `prefix` matches words that starts with the prefix.
 * The word after the prefix is the evaluated argument.
 * - `flag` matches words that are the same as its prefix.
 * The evaluated argument is either true or false.
 * - `text` matches the entire text, except for the command.
 * It ignores words that matches a prefix or a flag.
 * - `content` matches the entire text as it was inputted, except for the command.
 * - `none` matches nothing at all and an empty string will be used for type operations.
 * @typedef {string} ArgumentMatch
 */

/**
 * A function returning a method to match arguments.
 * @typedef {Function} ArgumentMatchFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {ArgumentMatch}
 */

/**
 * The type that the argument should be cast to.
 * - `string` does not cast to any type.
 * - `lowercase` makes the input lowercase.
 * - `uppercase` makes the input uppercase.
 * - `charCodes` transforms the input to an array of char codes.
 * - `number` casts to an number with `parseFloat()`.
 * - `integer` casts to an integer with `parseInt()`.
 * - `dynamic` casts to a number with `parseFloat()` or a trimmed input if not a number.
 * - `dynamicInt` casts to an integer with `parseInt()` or a trimmed input if not a number.
 * - `url` casts to an `URL` object.
 * - `date` casts to a `Date` object.
 * - `color` casts a hex code to an integer.
 * - `commandAlias` tries to resolve to a command from an alias.
 * - `command` matches the ID of a command.
 * - `inhibitor` matches the ID of an inhibitor.
 * - `listener` matches the ID of a listener.
 *
 * Possible Discord-related types.
 * These types can be plural (add an 's' to the end) and a collection of matching objects will be used.
 * - `user` tries to resolve to a user.
 * - `member` tries to resolve to a member.
 * - `relevant` tries to resolve to a relevant user, works in both guilds and DMs.
 * - `channel` tries to resolve to a channel.
 * - `textChannel` tries to resolve to a text channel.
 * - `voiceChannel` tries to resolve to a voice channel.
 * - `role` tries to resolve to a role.
 * - `emoji` tries to resolve to a custom emoji.
 * - `guild` tries to resolve to a guild.
 *
 * Other Discord-related types:
 * - `message` tries to fetch a message from an ID.
 * - `invite` tries to resolve an invite code from a link.
 * - `memberMention` matches a mention of a guild member.
 * - `channelMention` matches a mention of a channel.
 * - `roleMention` matches a mention of a role.
 * - `emojiMention` matches a mention of an emoji.
 *
 * An array of strings can be used to restrict input to only those strings, case insensitive.
 * The array can also contain an inner array of strings, for aliases.
 * If so, the first entry of the array will be used as the final argument.
 *
 * A regular expression can also be used.
 * The evaluated argument will be an object containing the `match` and `groups` if global.
 * @typedef {string|string[]} ArgumentType
 */

/**
 * A function for processing user input to use as an argument.
 * A return value of `true` will let the word pass.
 * A `null` or `undefined` return value will use the default value for the argument or start a prompt.
 * Any other truthy return value will be used as the evaluated argument.
 * If returning a Promise, the value resolved will be the argument.
 * A rejection will use the default value or start a prompt.
 * @typedef {Function} ArgumentTypeFunction
 * @param {string} word - The user input.
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {any}
 */

/**
 * A prompt to run if the user did not input the argument correctly.
 * Can only be used if there is not a default value (unless optional is true).
 * @typedef {Object} ArgumentPromptOptions
 * @prop {number} [retries=1] - Amount of times allowed to retries.
 * @prop {number} [time=30000] - Time to wait for input.
 * @prop {string} [cancelWord='cancel'] - Word to use for cancelling the command.
 * @prop {string} [stopWord='stop'] - Word to use for ending infinite prompts.
 * @prop {boolean} [optional=false] - Prompts only when argument is provided but was not of the right type.
 * @prop {boolean} [infinite=false] - Prompts forever until the stop word, cancel word, time limit, or retry limit.
 * Note that the retry count resets back to one on each valid entry.
 * The final evaluated argument will be an array of the inputs.
 * @prop {number} [limit=Infinite] - Amount of inputs allowed for an infinite prompt before finishing.
 * @prop {string|string[]|ArgumentPromptFunction} [start] - Text sent on start of prompt.
 * @prop {string|string[]|ArgumentPromptFunction} [retry] - Text sent on a retry (failure to cast type).
 * @prop {string|string[]|ArgumentPromptFunction} [timeout] - Text sent on collector time out.
 * @prop {string|string[]|ArgumentPromptFunction} [ended] - Text sent on amount of tries reaching the max.
 * @prop {string|string[]|ArgumentPromptFunction} [cancel] - Text sent on cancellation of command.
 */

/**
 * A function returning text for the prompt or a `MessageOptions` object.
 * The options can have an extra optional property called `content` for message content.
 * @typedef {Function} ArgumentPromptFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @param {number} tries - The amount of tries the user has taken.
 * @returns {string|string[]|MessageOptions}
 */

/**
 * Options for how an argument parses text.
 * @typedef {Object} ArgumentOptions
 * @prop {string} id - ID of the argument for use in the args object.
 * @prop {ArgumentMatch|ArgumentMatchFunction} [match='word'] - Method to match text.
 * @prop {ArgumentType|ArgumentTypeFunction} [type='string'] - Type to cast to.
 * @prop {string|string[]} [prefix] - The string(s) to use as the flag for prefix and flag args.
 * @prop {number} [index] - Index/word of text to start from.
 * Applicable to word, text, or content match only.
 * @prop {any|ArgumentDefaultFunction} [default=''] - Default value if text does not parse or cast correctly.
 * If using a flag arg, setting the default value inverses the result.
 * @prop {string|string[]} [description=''] - A description of the argument.
 * @prop {ArgumentPromptOptions} [prompt] - Prompt options for when user does not provide input.
 * Must not have a default value for this to work.
 */

/**
 * Function get the default value of the argument.
 * @typedef {Function} ArgumentDefaultFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {any}
 */
