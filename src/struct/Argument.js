const { ArgumentMatches, ArgumentTypes, Symbols } = require('../util/Constants');
const { isPromise } = require('../util/Util');

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
 * - `message` tries to fetch a message from an ID within the channel.
 * - `guildMessage` tries to fetch a message from an ID within the guild.
 * - `invite` tries to fetch an invite object from a link.
 * - `userMention` matches a mention of a user.
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
 * A function that checks the value of the argument.
 * If text is returned it will be sent and the command will be cancelled.
 * This behavior can be done manually anywhere else by throwing Constants.Symbols.COMMAND_CANCELLED.
 * @typedef {Function} ArgumentCancelFunction
 * @param {any} value - The value of the processed argument.
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|Promise<string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions>}
 */

/**
 * A function for processing user input to use as an argument.
 * A void return value will use the default value for the argument or start a prompt.
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
 * @prop {number} [limit=Infinity] - Amount of inputs allowed for an infinite prompt before finishing.
 * @prop {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|ArgumentPromptFunction} [start] - Text sent on start of prompt.
 * @prop {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|ArgumentPromptFunction} [retry] - Text sent on a retry (failure to cast type).
 * @prop {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|ArgumentPromptFunction} [timeout] - Text sent on collector time out.
 * @prop {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|ArgumentPromptFunction} [ended] - Text sent on amount of tries reaching the max.
 * @prop {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|ArgumentPromptFunction} [cancel] - Text sent on cancellation of command.
 * @prop {ArgumentPromptModifyFunction} [modifyStart] - Function to modify start prompts.
 * @prop {ArgumentPromptModifyFunction} [modifyRetry] - Function to modify retry prompts.
 * @prop {ArgumentPromptModifyFunction} [modifyTimeout] - Function to modify timeout messages.
 * @prop {ArgumentPromptModifyFunction} [modifyEnded] - Function to modify out of tries messages.
 * @prop {ArgumentPromptModifyFunction} [modifyCancel] - Function to modify cancel messages.
 */

/**
 * A function returning text for the prompt.
 * @typedef {Function} ArgumentPromptFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @param {ArgumentPromptData} data - Miscellaneous data.
 * @returns {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions}
 */

/**
 * A function modifying a prompt text.
 * @typedef {Function} ArgumentPromptModifyFunction
 * @param {string|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions} text - Text from the prompt to modify.
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @param {ArgumentPromptData} data - Miscellaneous data.
 * @returns {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions}
 */

/**
 * Data passed to argument prompt functions.
 * @typedef {Object} ArgumentPromptData
 * @prop {number} retries - Amount of retries.
 * @prop {boolean} infinite - Whether the prompt is infinite or not.
 * @prop {Message} message - The message that caused the prompt.
 * @prop {string} word - The input word that caused the prompt if there was one.
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
 * Ignored when used with the unordered option.
 * @prop {boolean|number|number[]} [unordered=false] - Marks the argument as unordered.
 * Each word is evaluated in order until one matches (no input at all means no evaluation).
 * Passing in a number forces evaluation of that index to the last word.
 * Passing in an array of numbers forces evaluation on those indices only.
 * If there is a match, that index is considered used and future unordered args will not check that index again.
 * If there is no match, then the prompting or default value is used.
 * Applicable to word match only.
 * @prop {number} [limit=Infinity] - Amount of words to match when matching more than one.
 * Applicable to text, content, rest, or separate match only.
 * @prop {any|ArgumentDefaultFunction} [default=null] - Default value if text does not parse or cast correctly.
 * If using a flag arg, setting the default value to a non-void value inverses the result.
 * @prop {string|string[]} [description=''] - A description of the argument.
 * @prop {ArgumentPromptOptions} [prompt] - Prompt options for when user does not provide input.
 * @prop {ArgumentAllowFunction} [allow] - A function that checks if this argument should be ran.
 * If not provided, this argument will always be ran.
 * @prop {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|ArgumentCancelFunction} [cancel] - Text to send if the command should be cancelled.
 * The command is to be cancelled if this option is provided and the value of the argument is null or undefined.
 * A function can be provided to check for cancellation and for the text to send.
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
        prefix = null,
        index = null,
        unordered = false,
        limit = Infinity,
        description = '',
        prompt = null,
        cancel = null,
        default: defaultValue = null,
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
         * @type {ArgumentMatch|ArgumentMatchFunction}
         */
        this.match = typeof match === 'function' ? match.bind(this) : match;

        /**
         * The type to cast to.
         * @type {ArgumentType|ArgumentTypeFunction}
         */
        this.type = typeof type === 'function' ? type.bind(this) : type;

        /**
         * The prefix to use for flag or prefix args.
         * @type {?string|string[]}
         */
        this.prefix = prefix;

        /**
         * The index to start from.
         * @type {?number}
         */
        this.index = index;

        /**
         * Whether or not the argument is unordered.
         * @type {boolean|number|number[]}
         */
        this.unordered = unordered;

        /**
         * The amount of words to match.
         * @type {number}
         */
        this.limit = limit;

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
         * The text or condition for when the command should be cancelled.
         * @type {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|ArgumentCancelFunction}
         */
        this.cancel = typeof cancel === 'function' ? cancel.bind(this) : cancel;

        /**
         * The default value of the argument.
         * @type {any|ArgumentDefaultFunction}
         */
        this.default = typeof defaultValue === 'function' ? defaultValue.bind(this) : defaultValue;

        /**
         * Checks if the argument is allowed to run.
         * @method
         * @name Argument#allow
         * @param {Message} message - The message that called the command.
         * @param {Object} args - Previous arguments from command.
         * @returns {boolean}
         */
        this.allow = allow.bind(this);
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
     * Processes the type casting and prompting of the argument for a word.
     * @param {string} word - The word to process.
     * @param {Message} message - The message that called the command.
     * @param {Object} args - Previous arguments from command.
     * @returns {Promise<any>}
     */
    async process(word, message, args = {}) {
        word = word.trim();

        const isOptional = (this.prompt && this.prompt.optional)
            || (this.command.defaultPrompt && this.command.defaultPrompt.optional)
            || (this.handler.defaultPrompt && this.handler.defaultPrompt.optional);

        if (!word && isOptional) {
            let res = typeof this.default === 'function' ? this.default(message, args) : this.default;
            if (isPromise(res)) res = await res;
            return res;
        }

        let res = await this.cast(word, message, args);

        if (res == null) {
            if (this.prompt) return this.collect(message, args, word);

            res = typeof this.default === 'function' ? this.default(message, args) : this.default;
            if (isPromise(res)) res = await res;
            return res;
        }

        return res;
    }

    /**
     * Casts a word to the argument's type.
     * @param {string} word - Word to process.
     * @param {Message} message - Message that called the command.
     * @param {Object} args - Previous arguments from command.
     * @returns {Promise<any>}
     */
    cast(word, message, args = {}) {
        return Argument.cast(this.type, this.handler.resolver, word, message, args);
    }

    /**
     * Collects input from the user by prompting.
     * Throws a Symbol if the command was cancelled via timeout or user cancel.
     * @param {Message} message - Message to prompt.
     * @param {Object} args - Previous arguments from command.
     * @param {string} [commandInput] - Previous input from command if there was one.
     * @returns {Promise<any>}
     */
    async collect(message, args = {}, commandInput = '') {
        const prompt = {};

        Object.assign(prompt, this.handler.defaultPrompt);
        Object.assign(prompt, this.command.defaultPrompt);
        Object.assign(prompt, this.prompt || {});

        const matchType = typeof this.match === 'function' ? this.match(message, args) : this.match;
        const isInfinite = prompt.infinite && (matchType === ArgumentMatches.SEPARATE ? !commandInput : true);
        const additionalRetry = prompt.optional ? 0 : Number(Boolean(commandInput));

        const values = isInfinite ? [] : null;
        if (isInfinite) args[this.id] = values;

        const getText = (promptType, prompter, retryCount, inputMessage, inputWord) => {
            let text = prompter;

            if (typeof prompter === 'function') {
                text = prompter.call(this, message, args, {
                    retries: retryCount,
                    infinite: isInfinite,
                    message: inputMessage,
                    word: inputWord
                });
            }

            if (Array.isArray(text)) {
                text = text.join('\n');
            }

            const modifier = {
                start: prompt.modifyStart,
                retry: prompt.modifyRetry,
                timeout: prompt.modifyTimeout,
                ended: prompt.modifyEnded,
                cancel: prompt.modifyCancel
            }[promptType];

            if (modifier) {
                text = modifier.call(this, text, message, args, {
                    retries: retryCount,
                    infinite: isInfinite,
                    message: inputMessage,
                    word: inputWord
                });
            }

            if (Array.isArray(text)) {
                text = text.join('\n');
            }

            return text;
        };

        // eslint-disable-next-line complexity
        const promptOne = async (prevMessage, retryCount) => {
            this.handler.addPrompt(message.channel, message.author);

            let sentStart;
            const shouldSend = retryCount === 1
                ? !isInfinite || (isInfinite && !values.length)
                : true;

            if (shouldSend) {
                let prevInput;
                if (retryCount <= 1 + additionalRetry) {
                    prevInput = commandInput || '';
                } else {
                    prevInput = prevMessage.content;
                }

                const promptType = retryCount === 1 ? 'start' : 'retry';
                const prompter = retryCount === 1 ? prompt.start : prompt.retry;
                const startText = getText(promptType, prompter, retryCount, prevMessage, prevInput);

                if (startText) {
                    sentStart = await (message.util || message.channel).send(startText);
                    if (message.util) {
                        message.util.setEditable(false);
                        message.util.setLastResponse(sentStart);
                        message.util.addMessage(sentStart);
                    }
                }
            }

            try {
                const input = (await message.channel.awaitMessages(m => {
                    if (sentStart && m.id === sentStart.id) return false;
                    if (m.author.id !== message.author.id) return false;
                    return true;
                }, {
                    max: 1,
                    time: prompt.time,
                    errors: ['time']
                })).first();

                if (message.util) message.util.addMessage(input);

                if (input.content.toLowerCase() === prompt.cancelWord.toLowerCase()) {
                    const cancelText = getText('cancel', prompt.cancel, retryCount, input, '');
                    if (cancelText) {
                        const sentCancel = await message.channel.send(cancelText);
                        if (message.util) message.util.addMessage(sentCancel);
                    }

                    this.handler.removePrompt(message.channel, message.author);
                    throw Symbols.COMMAND_CANCELLED;
                }

                if (isInfinite && input.content.toLowerCase() === prompt.stopWord.toLowerCase()) {
                    if (!values.length) return promptOne(input, retryCount + 1);
                    return values;
                }

                const parsedValue = await this.cast(input.content, input, args);
                if (parsedValue == null) {
                    if (retryCount <= prompt.retries) {
                        return promptOne(input, retryCount + 1);
                    }

                    const endedText = getText('ended', prompt.ended, retryCount, input, input.content);
                    if (endedText) {
                        const sentEnded = await message.channel.send(endedText);
                        if (message.util) message.util.addMessage(sentEnded);
                    }

                    this.handler.removePrompt(message.channel, message.author);
                    throw Symbols.COMMAND_CANCELLED;
                }

                if (isInfinite) {
                    values.push(parsedValue);
                    const limit = prompt.limit;
                    if (values.length < limit) return promptOne(message, 1);

                    return values;
                }

                return parsedValue;
            } catch (err) {
                if (err instanceof Error || err === Symbols.COMMAND_CANCELLED) {
                    this.handler.removePrompt(message.channel, message.author);
                    throw err;
                }

                const timeoutText = getText('timeout', prompt.timeout, retryCount, prevMessage, '');
                if (timeoutText) {
                    const sentTimeout = await message.channel.send(timeoutText);
                    if (message.util) message.util.addMessage(sentTimeout);
                }

                this.handler.removePrompt(message.channel, message.author);
                throw Symbols.COMMAND_CANCELLED;
            }
        };

        const returnValue = await promptOne(message, 1 + additionalRetry);
        if (this.handler.commandUtil) message.util.setEditable(false);
        this.handler.removePrompt(message.channel, message.author);
        return returnValue;
    }

    /**
     * Casts a word to the specified type.
     * @param {ArgumentType|ArgumentTypeFunction} type - Type to use.
     * @param {TypeResolver} resolver - Type resolver to use.
     * @param {string} word - Word to process.
     * @param {Message} message - Message that called the command.
     * @param {Object} args - Previous arguments from command.
     * @returns {Promise<any>}
     */
    static async cast(type, resolver, word, message, args) {
        if (Array.isArray(type)) {
            for (const entry of type) {
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

        if (typeof type === 'function') {
            let res = type(word, message, args);
            if (isPromise(res)) res = await res;
            if (res != null) return res;
            return null;
        }

        if (type instanceof RegExp) {
            const match = word.match(type);
            if (!match) return null;

            const matches = [];

            if (type.global) {
                let matched;

                while ((matched = type.exec(word)) != null) {
                    matches.push(matched);
                }
            }

            return { match, matches };
        }

        if (resolver.type(type)) {
            let res = resolver.type(type)(word, message, args);
            if (isPromise(res)) res = await res;
            if (res != null) return res;
            return null;
        }

        if (word) return word;
        return null;
    }

    /**
     * Creates a type from multiple types (union type).
     * The first type that resolves to a non-void value is used.
     * @param {...ArgumentType|ArgumentTypeFunction} types - Types to use.
     * @returns {ArgumentTypeFunction}
     */
    static some(...types) {
        return async function type(word, message, args) {
            for (let entry of types) {
                if (typeof entry === 'function') entry = entry.bind(this); // eslint-disable-line no-invalid-this
                // eslint-disable-next-line no-await-in-loop
                const res = await Argument.cast(entry, message.client.commandHandler.resolver, word, message, args);
                if (res != null) return res;
            }

            return null;
        };
    }

    /**
     * Creates a type from multiple types (intersection type).
     * Only inputs where each type resolves with a non-void value are valid.
     * @param {...ArgumentType|ArgumentTypeFunction} types - Types to use.
     * @returns {ArgumentTypeFunction}
     */
    static every(...types) {
        return async (word, message, args) => {
            const results = [];
            for (const entry of types) {
                // eslint-disable-next-line no-await-in-loop
                const res = await Argument.cast(entry, message.client.commandHandler.resolver, word, message, args);
                if (res == null) return null;
                results.push(res);
            }

            return results;
        };
    }
}

module.exports = Argument;
