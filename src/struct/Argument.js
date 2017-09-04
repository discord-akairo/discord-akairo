const { ArgumentMatches, ArgumentTypes, Symbols } = require('../util/Constants');
const { isPromise } = require('../util/Util');

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
 * - `separate` matches the rest of the words in order.
 * Unlike rest, each word is processed separately.
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
 * - `invite` tries to resolve an invite object from a link.
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
 * The evaluated argument will be an object containing the `match` and `matches` if global.
 * @typedef {string|string[]} ArgumentType
 */

/**
 * A function that checks if the argument should be allowed to run.
 * @typedef {Function} ArgumentAllowFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {boolean}
 */

/**
 * A function for processing user input to use as an argument.
 * A `null` or `undefined` return value will use the default value for the argument or start a prompt.
 * Any other truthy return value will be used as the evaluated argument.
 * If returning a Promise, the resolved value will go through the above steps.
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
 * Note that even if the command isn't ran, all prefixes are separated from the content.
 * @prop {number} [index] - Index/word of text to start from.
 * Applicable to word, text, content, rest, or separate match only.
 * @prop {any|ArgumentDefaultFunction} [default=''] - Default value if text does not parse or cast correctly.
 * If using a flag arg, setting the default value to a non-null/undefined value inverses the result.
 * @prop {string|string[]} [description=''] - A description of the argument.
 * @prop {ArgumentPromptOptions} [prompt] - Prompt options for when user does not provide input.
 * Must not have a default value for this to work.
 * @prop {ArgumentAllowFunction} [allow] - A function that checks if this argument should be ran.
 * If not provided, this argument will always be ran.
 */

/**
 * Function get the default value of the argument.
 * @typedef {Function} ArgumentDefaultFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {any}
 */

class Argument {
    /**
     * An argument for a command.
     * @param {Command} command - Command of the argument.
     * @param {ArgumentOptions} options - Options for the argument.
     */
    constructor(command, {
        id,
        match = ArgumentMatches.WORD,
        type = ArgumentTypes.STRING,
        prefix,
        index,
        description = '',
        prompt,
        default: defaultValue = '',
        allow = () => true
    } = {}) {
        /**
         * The ID of the argument.
         * @type {string}
         */
        this.id = id;

        /**
         * The command this argument belongs to.
         * @type {Command}
         */
        this.command = command;

        /**
         * The method to match text.
         * @type {ArgumentMatch}
         */
        this.match = match;

        /**
         * The type to cast to.
         * @type {ArgumentType}
         */
        this.type = type;

        /**
         * The prefix to use for flag or prefix args.
         * @type {?string | string[]}
         */
        this.prefix = prefix;

        /**
         * The index to skip to.
         * @type {?number}
         */
        this.index = index;

        /**
         * The description.
         * @type {string}
         */
        this.description = Array.isArray(description) ? description.join('\n') : description;

        /**
         * The prompt options.
         * @type {?ArgumentPromptOptions}
         */
        this.prompt = prompt;

        /**
         * The default value.
         * @method
         * @name Argument#default
         * @param {Message} message - The message that called the command.
         * @param {Object} args - Previous arguments from command.
         * @returns {any}
         */
        this.default = typeof defaultValue === 'function' ? defaultValue : () => defaultValue;

        /**
         * Checks if the argument is allowed to run.
         * @method
         * @name Argument#allow
         * @param {Message} message - The message that called the command.
         * @param {Object} args - Previous arguments from command.
         * @returns {boolean}
         */
        this.allow = allow;
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
    async cast(word, message, args) {
        word = word.trim();

        if (!word && this.prompt && this.prompt.optional) {
            let res = this.default(message, args);
            if (isPromise(res)) res = await res;
            return res;
        }

        let res = await this._processType(word, message, args);

        if (res == null) {
            if (this.prompt) return this._promptArgument(message, args, Boolean(word));

            res = this.default(message, args);
            if (isPromise(res)) res = await res;
            return res;
        }

        return res;
    }

    /**
     * Processes the type casting.
     * @private
     * @param {string} word - Word to process.
     * @param {Message} message - Message that called the command.
     * @param {Object} args - Previous arguments from command.
     * @returns {Promise<any>}
     */
    async _processType(word, message, args) {
        if (Array.isArray(this.type)) {
            for (const entry of this.type) {
                if (Array.isArray(entry)) {
                    if (entry.some(t => t.toLowerCase() === word.toLowerCase())) {
                        return entry[0];
                    }
                } else
                if (entry.toLowerCase() === word.toLowerCase()) {
                    return entry;
                }
            }

            return null;
        }

        if (typeof this.type === 'function') {
            let res = this.type(word, message, args);
            if (isPromise(res)) res = await res;
            if (res != null) return res;
            return null;
        }

        if (this.type instanceof RegExp) {
            const match = word.match(this.type);
            if (!match) return null;

            const matches = [];

            if (this.type.global) {
                let matched;

                while ((matched = this.type.exec(word)) != null) {
                    matches.push(matched);
                }
            }

            return { match, matches };
        }

        if (this.handler.resolver.type(this.type)) {
            let res = this.handler.resolver.type(this.type)(word, message, args);
            if (isPromise(res)) res = await res;
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
     * @param {boolean} hadInput - Whether or not there was already input.
     * @returns {Promise<any>}
     */
    async _promptArgument(message, args, hadInput) {
        const prompt = {};

        Object.assign(prompt, this.handler.defaultPrompt);
        Object.assign(prompt, this.command.defaultPrompt);
        Object.assign(prompt, this.prompt || {});

        const values = prompt.infinite ? [] : null;
        if (prompt.infinite) args[this.id] = values;

        const getText = (textOption, retryCount) => {
            textOption = typeof textOption === 'function'
                ? textOption.call(this, message, args, retryCount)
                : `${message.author}, ${Array.isArray(textOption) ? textOption.join('\n') : textOption}`;

            textOption = Array.isArray(textOption) ? textOption.join('\n') : textOption;
            return textOption;
        };

        const promptOne = async retryCount => {
            this.handler.addPrompt(message);

            const startText = getText(retryCount === 1 ? prompt.start : prompt.retry, retryCount);

            let sent;
            if (startText) {
                sent = await (message.util || message.channel).send(startText);
                if (this.handler.commandUtil) {
                    message.util.shouldEdit = false;
                    message.util.setLastResponse(sent);
                }
            }

            try {
                const input = (await message.channel.awaitMessages(m => {
                    if (sent && m.id === sent.id) return false;
                    if (m.author.id !== message.author.id) return false;
                    return true;
                }, {
                    max: 1,
                    time: prompt.time,
                    errors: ['time']
                })).first();

                if (input.content.toLowerCase() === prompt.cancelWord.toLowerCase()) {
                    const cancelText = getText(prompt.cancel, retryCount);
                    if (cancelText) {
                        await message.channel.send(cancelText);
                    }

                    this.handler.removePrompt(message);
                    throw Symbols.COMMAND_CANCELLED;
                }

                if (prompt.infinite && input.content.toLowerCase() === prompt.stopWord.toLowerCase()) {
                    if (!values.length) return promptOne(retryCount + 1);
                    return values;
                }

                const parsedValue = await this._processType(input.content, input, args);
                if (parsedValue == null) return promptOne(retryCount + 1);

                if (prompt.infinite) {
                    values.push(parsedValue);
                    if (prompt.infinite) {
                        const limit = prompt.limit == null ? Infinity : prompt.limit;
                        if (values.length < limit) return promptOne(1);
                    }

                    return values;
                }

                return parsedValue;
            } catch (err) {
                if (err instanceof Error) throw err;
                if (err === Symbols.COMMAND_CANCELLED) throw err;

                const timeoutText = getText(prompt.timeout, retryCount);
                if (timeoutText) {
                    await message.channel.send(timeoutText);
                }

                this.handler.removePrompt(message);
                throw Symbols.COMMAND_CANCELLED;
            }
        };

        const returnValue = await promptOne(1 + Number(hadInput));
        if (this.handler.commandUtil) message.util.shouldEdit = false;
        this.handler.removePrompt(message);
        return returnValue;
    }
}

module.exports = Argument;
