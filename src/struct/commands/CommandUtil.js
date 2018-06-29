const { Collection } = require('discord.js');

/**
 * Extra properties applied to the Discord.js message object.
 * @typedef {Object} MessageExtensions
 * @prop {?CommandUtil} util - Utilities for command responding.
 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
 * Not all properties of the util are available, depending on the input.
 */

class CommandUtil {
    /**
     * Command utilies.
     * @param {CommandHandler} handler - The command handler.
     * @param {Message} message - Message that triggered the command.
     */
    constructor(handler, message) {
        /**
         * The command handler.
         * @type {CommandHandler}
         */
        this.handler = handler;

        /**
         * Message that triggered the command.
         * @type {Message}
         */
        this.message = message;

        /**
         * Command used.
         * @type {?Command}
         */
        this.command = null;

        /**
         * The prefix used.
         * @type {?string}
         */
        this.prefix = null;

        /**
         * The alias used.
         * @type {?string}
         */
        this.alias = null;

        /**
         * The parsed content.
         * @type {?string}
         */
        this.content = null;

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

        if (this.handler.storeMessages) {
            /**
             * Messages stored from prompts and prompt replies.
             * @type {Collection<Snowflake, Message>}
             */
            this.messages = new Collection();
        } else {
            this.messages = null;
        }
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
     * Adds client prompt or user reply to messages.
     * @param {Message|Message[]} message - Message to add.
     * @returns {Message|Message[]}
     */
    addMessage(message) {
        if (this.handler.storeMessages) {
            if (Array.isArray(message)) {
                for (const msg of message) {
                    this.messages.set(msg.id, msg);
                }
            } else {
                this.messages.set(message.id, message);
            }
        }

        return message;
    }

    /**
     * Changes if the message should be edited.
     * @param {boolean} state - Change to editable or not.
     * @returns {CommandUtil}
     */
    setEditable(state) {
        this.shouldEdit = Boolean(state);
        return this;
    }

    /**
     * Sends a response or edits an old response if available.
     * @param {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageOptions|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    async send(content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        const hasFiles = (options.files && options.files.length > 0) || (options.embed && options.embed.files.length > 0);

        if (this.shouldEdit && (this.command ? this.command.editable : true) && !hasFiles && !this.lastResponse.attachments.size) {
            return this.lastResponse.edit(content, options);
        }

        const sent = await this.message.channel.send(content, options);
        const lastSent = this.setLastResponse(sent);
        this.setEditable(!lastSent.attachments.size);
        return sent;
    }

    /**
     * Sends a response, overwriting the last response.
     * @param {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions} content - Content to send.
     * @param {MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    async sendNew(content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        const sent = await this.message.channel.send(content, options);

        const lastSent = this.setLastResponse(sent);
        this.setEditable(!lastSent.attachments.size);
        return sent;
    }

    /**
     * Sends a response with a mention concantenated to it.
     * @param {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message|Message[]>}
     */
    reply(content, options) {
        [content, options] = this.constructor.swapOptions(content, options);
        return this.send(content, Object.assign(options, { reply: this.message.member || this.message.author }));
    }

    /**
     * Edits the last response.
     * @param {string|string[]|MessageEmbed|MessageEditOptions} content - Content to send.
     * @param {MessageEmbed|MessageEditOptions} [options] - Options to use.
     * @returns {Promise<Message>}
     */
    edit(content, options) {
        return this.lastResponse.edit(content, options);
    }

    /**
     * Swaps and cleans up content and options.
     * @param {string|string[]|MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions|MessageEditOptions} content - Content to send.
     * @param {MessageEmbed|MessageAttachment|MessageAttachment[]|MessageOptions} [options] - Options to use.
     * @returns {Array}
     */
    static swapOptions(content, options) {
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            content = '';
        } else if (!options) {
            options = {};
        }

        if (!options.embed) options.embed = null;
        return [content, options];
    }
}

module.exports = CommandUtil;
