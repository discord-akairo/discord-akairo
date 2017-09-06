/**
 * Extra properties applied to the Discord.js message object.
 * @typedef {Object} MessageExtensions
 * @prop {?CommandUtil} util - Utilities for command responding.
 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client, notSelf).
 * Not all properties of the util are available, depending on the input.
 */

class CommandUtil {
    /**
     * Command utilies.
     * @param {AkairoClient} client - The Akairo client.
     * @param {Message} message - Message that triggered the command.
     * @param {Command} [command] - Command triggered.
     * @param {string} [prefix] - Prefix used to trigger.
     * @param {string} [alias] - Alias used to trigger.
     */
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
         * @type {?Command}
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
     * @returns {Message}
     */
    setLastResponse(message) {
        if (Array.isArray(message)) {
            this.lastResponse = message.slice(-1)[0];
        } else {
            this.lastResponse = message;
        }

        return this.lastResponse;
    }

    /**
     * Sends a response or edits an old response if available.
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    async send(content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        const hasFiles = options.files || (options.embed && options.embed.files);

        if (this.shouldEdit && (this.command ? this.command.editable : true) && !hasFiles && !this.lastResponse.attachments.size) {
            return this.lastResponse.edit(content, options);
        }

        const sent = await this.message.channel.send(content, options);
        const lastSent = this.setLastResponse(sent);
        this.shouldEdit = !lastSent.attachments.size;
        return sent;
    }

    /**
     * Sends a response, overwriting the last response.
     * @param {string|MessageOptions} content - Content to send.
     * @param {MessageOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    async sendNew(content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        const sent = await this.message.channel.send(content, options);

        const lastSent = this.setLastResponse(sent);
        this.shouldEdit = !lastSent.attachments.size;
        return sent;
    }

    /**
     * Sends a response with a mention concantenated to it.
     * @param {string|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    reply(content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        return this.send(content, Object.assign(options, { reply: this.message.member || this.message.author }));
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
        if (!options && Object(content) === content && !Array.isArray(content)) {
            options = content;
            content = options.content || '';
        } else
        if (!options) {
            options = {};
        }

        if (!options.embed) options.embed = null;
        return [content, options];
    }
}

module.exports = CommandUtil;
