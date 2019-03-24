/**
 * Command utilies.
 * @param {AkairoClient} client - The Akairo client.
 * @param {Message} message - Message that triggered the command.
 * @param {Command} command - Command triggered.
 * @param {string} [prefix] - Prefix used to trigger.
 * @param {string} [alias] - Alias used to trigger.
 */
class CommandUtil {
    constructor(client, message, command, prefix, alias) {
        /**
         * The Akairo client.
         * @readonly
         * @name CommandUtil#client
         * @type {AkairoClient}
         */
        Object.defineProperties(this, {
            client: {
                value: client
            }
        });

        /**
         * Message that triggered the command.
         * @type {Message}
         */
        this.message = message;

        /**
         * Command used.
         * @type {Command}
         */
        this.command = command;

        /**
         * The prefix used.
         * @type {?string}
         */
        this.prefix = prefix;

        /**
         * The alias used.
         * @type {?string}
         */
        this.alias = alias;

        /**
         * Whether or not the last response should be edited.
         * @type {boolean}
         */
        this.shouldEdit = false;

        /**
          * The last response sent.
          * @type {?Message}
         */
        this.lastResponse = null;
    }

    /**
     * Sets the last repsonse.
     * @param {Message|Message[]} message - Message to set.
     * @returns {void}
     */
    setLastResponse(message) {
        if (message.command && (!this.command.handler.handleEdits || !this.command.editable)) return;
        if (Array.isArray(message)) {
            this.lastResponse = message.slice(-1)[0];
        } else {
            this.lastResponse = message;
        }
    }

    /**
     * Sends a response or edits an old response if available.
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    send(content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        const hadFiles = (options.file || options.files)
        || (options.embed && (options.embed.file || options.embed.files));

        if (this.shouldEdit && (this.command ? this.command.editable : true) && (hadFiles || !this.lastResponse.attachments.size)) {
            return this.lastResponse.edit(content, options);
        }

        return this.message.channel.send(content, options).then(sent => {
            if (hadFiles || (this.lastResponse && this.lastResponse.attachments.size)) return sent;

            this.shouldEdit = true;
            this.setLastResponse(sent);
            return sent;
        });
    }

    /**
     * Sends a response or edits an old response if available.
     * @deprecated Use CommandUtil#send
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    sendMessage(content, options) {
        return this.send(content, options);
    }

    /**
     * Sends a response in a codeblock or edits an old response if available.
     * @deprecated Use CommandUtil#send
     * @param {string} code - Language to use for syntax highlighting.
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    sendCode(code, content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        options.code = code;
        return this.send(content, options);
    }

    /**
     * Sends a response with an embed or edits an old response if available.
     * @deprecated Use CommandUtil#send
     * @param {RichEmbed|Object} embed - Embed to send.
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    sendEmbed(embed, content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        options.embed = embed;
        return this.send(content, options);
    }

    /**
     * Sends a response with a mention concantenated to it.
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    reply(content, options) {
        if (this.message.channel.type !== 'dm') content = `${this.message.author}, ${content}`;
        return this.send(content, options);
    }

    /**
     * Edits the last response.
     * @param {string|MessageEditOptions} content - Content to send.
     * @param {MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message>}
     */
    edit(content, options) {
        return this.lastResponse.edit(content, options);
    }

    /**
     * Swaps and cleans up content and options.
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions} [options] - Options to use.
     * @returns {Array}
     */
    static swapOptions(content, options) {
        if (!options && typeof content === 'object' && !(content instanceof Array)) {
            options = content;
            content = options.content || '';
        } else if (!options) {
            options = {};
        }

        if (!options.embed) options.embed = null;
        return [content, options];
    }
}

module.exports = CommandUtil;

/**
 * Extra properties applied to the Discord.js message object.
 * @typedef {Object} MessageExtensions
 * @prop {?CommandUtil} util - Utilities for command responding.
 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client, notSelf).
 * Not all properties of the util are available, depending on the input.
 */
