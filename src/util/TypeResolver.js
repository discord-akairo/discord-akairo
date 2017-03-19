const { ArgumentTypes } = require('./Constants');
const { Collection } = require('discord.js');

class TypeResolver {
    /**
     * Type resolver for command arguments.
     * <br>The types are documented under ArgumentType.
     * @param {AkairoClient} client - The client.
     */
    constructor(client) {
        /**
         * The Akairo client.
         * @readonly
         * @name ClientUtil#client
         * @type {AkairoClient}
         */
        Object.defineProperty(this, 'client', {
            value: client
        });
    }

    [ArgumentTypes.STRING](word) {
        return word || null;
    }

    [ArgumentTypes.NUMBER](word) {
        if (!word || isNaN(word) || !/\S/.test(word)) return null;
        return parseFloat(word);
    }

    [ArgumentTypes.INTEGER](word) {
        if (!word || isNaN(word) || !/\S/.test(word)) return null;
        return parseInt(word);
    }

    [ArgumentTypes.DYNAMIC](word) {
        if (!word) return null;
        if (isNaN(word) || !/\S/.test(word)) return word;
        return parseFloat(word);
    }

    [ArgumentTypes.DYNAMIC_INT](word) {
        if (!word) return null;
        if (isNaN(word) || !/\S/.test(word)) return word;
        return parseInt(word);
    }

    [ArgumentTypes.USER](word) {
        const res = val => this.client.util.resolveUser(val, this.client.users);
        if (!word) return null;
        return res(word);
    }

    [ArgumentTypes.USERS](word) {
        const res = val => this.client.util.resolveUsers(val, this.client.users);
        if (!word) return null;
        const users = res(word);
        return users.size ? users : null;
    }

    [ArgumentTypes.MEMBER](word, message) {
        const res = val => this.client.util.resolveMember(val, message.guild.members);
        if (!word) return null;
        return res(word);
    }

    [ArgumentTypes.MEMBERS](word, message) {
        const res = val => this.client.util.resolveMembers(val, message.guild.members);
        if (!word) return null;
        const members = res(word);
        return members.size ? members : null;
    }

    [ArgumentTypes.RELEVANT](word, message) {
        if (!word) return null;

        const res = message.channel.type === 'text'
        ? val => this.client.util.resolveMember(val, message.guild.members)
        : message.channel.type === 'dm'
        ? val => this.client.util.resolveUser(val, new Collection([
            [message.channel.recipient.id, message.channel.recipient],
            [this.client.user.id, this.client.user]
        ]))
        : val => this.client.util.resolveUser(val, new Collection([
            [this.client.user.id, this.client.user]
        ]).concat(message.channel.recipients));

        const person = res(word);

        if (!person) return null;
        if (message.channel.type === 'text') return person.user;
        return person;
    }

    [ArgumentTypes.RELEVANTS](word, message) {
        if (!word) return null;

        const res = message.channel.type === 'text'
        ? val => this.client.util.resolveMembers(val, message.guild.members)
        : message.channel.type === 'dm'
        ? val => this.client.util.resolveUsers(val, new Collection([
            [message.channel.recipient.id, message.channel.recipient],
            [this.client.user.id, this.client.user]
        ]))
        : val => this.client.util.resolveUsers(val, new Collection([
            [this.client.user.id, this.client.user]
        ]).concat(message.channel.recipients));

        const persons = res(word);

        if (!persons.size) return null;
        if (message.channel.type === 'text') return new Collection(persons.map(m => [m.id, m.user]));
        return persons;
    }

    [ArgumentTypes.CHANNEL](word, message) {
        const res = val => this.client.util.resolveChannel(val, message.guild.channels);
        if (!word) return null;
        return res(word);
    }

    [ArgumentTypes.CHANNELS](word, message) {
        const res = val => this.client.util.resolveChannels(val, message.guild.channels);
        if (!word) return null;
        const channels = res(word);
        return channels.size ? channels : null;
    }

    [ArgumentTypes.TEXT_CHANNEL](word, message) {
        const res = val => this.client.util.resolveChannel(val, message.guild.channels);
        if (!word) return null;

        const channel = res(word);
        if (!channel || channel.type !== 'text') return null;

        return channel;
    }

    [ArgumentTypes.TEXT_CHANNELS](word, message) {
        const res = val => this.client.util.resolveChannels(val, message.guild.channels);
        if (!word) return null;

        const channels = res(word);
        if (!channels.size || channels.every(c => c.type !== 'text')) return null;

        return channels.filter(c => c.type === 'text');
    }

    [ArgumentTypes.VOICE_CHANNEL](word, message) {
        const res = val => this.client.util.resolveChannel(val, message.guild.channels);
        if (!word) return null;

        const channel = res(word);
        if (!channel || channel.type !== 'voice') return null;

        return channel;
    }

    [ArgumentTypes.VOICE_CHANNELS](word, message) {
        const res = val => this.client.util.resolveChannels(val, message.guild.channels);
        if (!word) return null;

        const channels = res(word);
        if (!channels.size || channels.every(c => c.type !== 'voice')) return null;

        return channels.filter(c => c.type === 'voice');
    }

    [ArgumentTypes.ROLE](word, message) {
        const res = val => this.client.util.resolveRole(val, message.guild.roles);
        if (!word) return null;
        return res(word);
    }

    [ArgumentTypes.ROLES](word, message) {
        const res = val => this.client.util.resolveRoles(val, message.guild.roles);
        if (!word) return null;
        const roles = res(word);
        return roles.size ? roles : null;
    }

    [ArgumentTypes.EMOJI](word, message) {
        const res = val => this.client.util.resolveEmoji(val, message.guild.emojis);
        if (!word) return null;
        return res(word);
    }

    [ArgumentTypes.EMOJIS](word, message) {
        const res = val => this.client.util.resolveEmojis(val, message.guild.emojis);
        if (!word) return null;
        const emojis = res(word);
        return emojis.size ? emojis : null;
    }

    [ArgumentTypes.GUILD](word) {
        const res = val => this.client.util.resolveGuild(val, this.client.guilds);
        if (!word) return null;
        return res(word);
    }

    [ArgumentTypes.GUILDS](word) {
        const res = val => this.client.util.resolveGuilds(val, this.client.guilds);
        if (!word) return null;
        const guilds = res(word);
        return guilds.size ? guilds : null;
    }

    [ArgumentTypes.MESSAGE](word, message) {
        if (!word) return null;
        return this.client.util.fetchMessage(message.channel, word).catch(() => {
            return new Promise((resolve, reject) => reject());
        });
    }

    /**
     * Adds a new type.
     * @param {string} name - Name of the type.
     * @param {Function} resolver - Function <code>((word, message) => {})</code> that resolves the type.
     * <br>Returning null means that the type could not be resolved.
     * @returns {void}
     */
    addType(name, resolver) {
        if (name === 'client' || name === 'addType') throw new Error(`Argument type ${name} is reserved.`);
        if (this[name]) throw new Error(`Argument type ${name} already exists.`);

        Object.defineProperty(this, name, {
            value: resolver.bind(this)
        });
    }
}

module.exports = TypeResolver;
