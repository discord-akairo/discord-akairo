const { ArgumentTypes } = require('../util/Constants');
const { Collection } = require('discord.js');
const { URL } = require('url');

/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 * @param {CommandHandler} handler - The command handler.
 */
class TypeResolver {
    constructor(handler) {
        /**
         * The Akairo client.
         * @readonly
         * @name TypeResolver#client
         * @type {AkairoClient}
         */
        Object.defineProperty(this, 'client', {
            value: handler.client
        });

        /**
         * The command handler.
         * @type {CommandHandler}
         */
        this.handler = handler;
    }

    [ArgumentTypes.STRING](word) {
        return word || null;
    }

    [ArgumentTypes.LOWERCASE](word) {
        return word ? word.toLowerCase() : null;
    }

    [ArgumentTypes.UPPERCASE](word) {
        return word ? word.toUpperCase() : null;
    }

    [ArgumentTypes.CHAR_CODES](word) {
        if (!word) return null;
        const codes = [];
        for (const char of word) codes.push(char.charCodeAt(0));
        return codes;
    }

    [ArgumentTypes.NUMBER](word) {
        if (!word || isNaN(word)) return null;
        return parseFloat(word);
    }

    [ArgumentTypes.INTEGER](word) {
        if (!word || isNaN(word)) return null;
        return parseInt(word);
    }

    [ArgumentTypes.DYNAMIC](word) {
        if (!word) return null;
        if (isNaN(word)) return word;
        return parseFloat(word);
    }

    [ArgumentTypes.DYNAMIC_INT](word) {
        if (!word) return null;
        if (isNaN(word)) return word;
        return parseInt(word);
    }

    [ArgumentTypes.URL](word) {
        if (!word) return null;
        if (/^<.+>$/.test(word)) word = word.slice(1, -1);

        try {
            return new URL(word);
        } catch (err) {
            return null;
        }
    }

    [ArgumentTypes.DATE](word) {
        if (!word) return null;
        const timestamp = Date.parse(word);
        if (isNaN(timestamp)) return null;
        return new Date(timestamp);
    }

    [ArgumentTypes.COLOR](word) {
        if (!word) return null;

        const color = parseInt(word.replace('#', ''), 16);
        if (color < 0 || color > 0xFFFFFF || isNaN(color)) {
            return null;
        }

        return color;
    }

    [ArgumentTypes.USER](word) {
        if (!word) return null;
        return this.client.util.resolveUser(word, this.client.users);
    }

    [ArgumentTypes.USERS](word) {
        if (!word) return null;
        const users = this.client.util.resolveUsers(word, this.client.users);
        return users.size ? users : null;
    }

    [ArgumentTypes.MEMBER](word, message) {
        if (!word) return null;
        return this.client.util.resolveMember(word, message.guild.members);
    }

    [ArgumentTypes.MEMBERS](word, message) {
        if (!word) return null;
        const members = this.client.util.resolveMembers(word, message.guild.members);
        return members.size ? members : null;
    }

    [ArgumentTypes.RELEVANT](word, message) {
        if (!word) return null;

        const person = message.channel.type === 'text'
            ? this.client.util.resolveMember(word, message.guild.members)
            : message.channel.type === 'dm'
                ? this.client.util.resolveUser(word, new Collection([
                    [message.channel.recipient.id, message.channel.recipient],
                    [this.client.user.id, this.client.user]
                ]))
                : this.client.util.resolveUser(word, new Collection([
                    [this.client.user.id, this.client.user]
                ]).concat(message.channel.recipients));

        if (!person) return null;
        if (message.channel.type === 'text') return person.user;
        return person;
    }

    [ArgumentTypes.RELEVANTS](word, message) {
        if (!word) return null;

        const persons = message.channel.type === 'text'
            ? this.client.util.resolveMembers(word, message.guild.members)
            : message.channel.type === 'dm'
                ? this.client.util.resolveUsers(word, new Collection([
                    [message.channel.recipient.id, message.channel.recipient],
                    [this.client.user.id, this.client.user]
                ]))
                : this.client.util.resolveUsers(word, new Collection([
                    [this.client.user.id, this.client.user]
                ]).concat(message.channel.recipients));

        if (!persons.size) return null;

        if (message.channel.type === 'text') {
            const coll = new Collection();
            for (const person of persons) coll.set(person.id, person.user);
            return coll;
        }

        return persons;
    }

    [ArgumentTypes.CHANNEL](word, message) {
        if (!word) return null;
        return this.client.util.resolveChannel(word, message.guild.channels);
    }

    [ArgumentTypes.CHANNELS](word, message) {
        if (!word) return null;
        const channels = this.client.util.resolveChannels(word, message.guild.channels);
        return channels.size ? channels : null;
    }

    [ArgumentTypes.TEXT_CHANNEL](word, message) {
        if (!word) return null;

        const channel = this.client.util.resolveChannel(word, message.guild.channels);
        if (!channel || channel.type !== 'text') return null;

        return channel;
    }

    [ArgumentTypes.TEXT_CHANNELS](word, message) {
        if (!word) return null;

        const channels = this.client.util.resolveChannels(word, message.guild.channels);
        if (!channels.size) return null;

        const textChannels = channels.filter(c => c.type === 'text');
        return textChannels.size ? textChannels : null;
    }

    [ArgumentTypes.VOICE_CHANNEL](word, message) {
        if (!word) return null;

        const channel = this.client.util.resolveChannel(word, message.guild.channels);
        if (!channel || channel.type !== 'voice') return null;

        return channel;
    }

    [ArgumentTypes.VOICE_CHANNELS](word, message) {
        if (!word) return null;

        const channels = this.client.util.resolveChannels(word, message.guild.channels);
        if (!channels.size) return null;

        const voiceChannels = channels.filter(c => c.type === 'voice');
        return voiceChannels.size ? voiceChannels : null;
    }

    [ArgumentTypes.ROLE](word, message) {
        if (!word) return null;
        return this.client.util.resolveRole(word, message.guild.roles);
    }

    [ArgumentTypes.ROLES](word, message) {
        if (!word) return null;
        const roles = this.client.util.resolveRoles(word, message.guild.roles);
        return roles.size ? roles : null;
    }

    [ArgumentTypes.EMOJI](word, message) {
        if (!word) return null;
        return this.client.util.resolveEmoji(word, message.guild.emojis);
    }

    [ArgumentTypes.EMOJIS](word, message) {
        if (!word) return null;
        const emojis = this.client.util.resolveEmojis(word, message.guild.emojis);
        return emojis.size ? emojis : null;
    }

    [ArgumentTypes.GUILD](word) {
        if (!word) return null;
        return this.client.util.resolveGuild(word, this.client.guilds);
    }

    [ArgumentTypes.GUILDS](word) {
        if (!word) return null;
        const guilds = this.client.util.resolveGuilds(word, this.client.guilds);
        return guilds.size ? guilds : null;
    }

    [ArgumentTypes.MESSAGE](word, message) {
        if (!word) return null;
        return message.channel.fetchMessage(word).catch(() => Promise.reject());
    }

    [ArgumentTypes.INVITE](word) {
        if (!word) return null;
        const match = word.match(/discord(?:app\.com\/invite|\.gg)\/([\w-]{2,255})/i);
        if (match && match[1]) return match[1];
        return null;
    }

    [ArgumentTypes.MEMBER_MENTION](word, message) {
        if (!word) return null;
        const id = word.match(/<@!?(\d+)>/);
        if (!id) return null;
        return message.guild.members.get(id[1]) || null;
    }

    [ArgumentTypes.CHANNEL_MENTION](word, message) {
        if (!word) return null;
        const id = word.match(/<#(\d+)>/);
        if (!id) return null;
        return message.guild.channels.get(id[1]) || null;
    }

    [ArgumentTypes.ROLE_MENTION](word, message) {
        if (!word) return null;
        const id = word.match(/<@&(\d+)>/);
        if (!id) return null;
        return message.guild.roles.get(id[1]) || null;
    }

    [ArgumentTypes.EMOJI_MENTION](word, message) {
        if (!word) return null;
        const id = word.match(/<a?:[a-zA-Z0-9_]+:(\d+)>/);
        if (!id) return null;
        return message.guild.emojis.get(id[1]) || null;
    }

    [ArgumentTypes.COMMAND_ALIAS](word) {
        if (!word) return null;
        return this.client.commandHandler.findCommand(word) || null;
    }

    [ArgumentTypes.COMMAND](word) {
        if (!word) return null;
        return this.client.commandHandler.modules.get(word) || null;
    }

    [ArgumentTypes.INHIBITOR](word) {
        if (!word) return null;
        return this.client.inhibitorHandler.modules.get(word) || null;
    }

    [ArgumentTypes.LISTENER](word) {
        if (!word) return null;
        return this.client.listenerHandler.modules.get(word) || null;
    }

    /**
     * Gets the resolver function for a type.
     * @param {string} name - Name of type.
     * @returns {Function}
     */
    type(name) {
        return this[name].bind(this);
    }

    /**
     * Adds a new type.
     * @param {string} name - Name of the type.
     * @param {ArgumentTypeFunction} resolver - Function that resolves the type.
     * @returns {TypeResolver}
     */
    addType(name, resolver) {
        if (['client', 'addType', 'addTypes'].includes(name)) throw new Error(`Argument type ${name} is reserved.`);

        Object.defineProperty(this, name, {
            value: resolver.bind(this)
        });

        return this;
    }

    /**
     * Adds multiple new types.
     * @param {Object} types  - Object with keys as the type name and values as the resolver function.
     * @returns {TypeResolver}
     */
    addTypes(types) {
        for (const key of Object.keys(types)) {
            this.addType(key, types[key]);
        }

        return this;
    }
}

module.exports = TypeResolver;
