const AkairoError = require('../../../util/AkairoError');
const { Collection } = require('discord.js');
const { URL } = require('url');

const mentionTypes = {
    user: (message, phrase) => {
        if (!phrase) return null;
        const id = phrase.match(/<@!?(\d{17,19})>/);
        if (!id) return null;
        return message.client.users.cache.get(id[1]) || null;
    },

    member: (message, phrase) => {
        if (!phrase) return null;
        const id = phrase.match(/<@!?(\d{17,19})>/);
        if (!id) return null;
        return message.guild.members.cache.get(id[1]) || null;
    },

    channel: (message, phrase) => {
        if (!phrase) return null;
        const id = phrase.match(/<#(\d{17,19})>/);
        if (!id) return null;
        return message.guild.channels.cache.get(id[1]) || null;
    },

    role: (message, phrase) => {
        if (!phrase) return null;
        const id = phrase.match(/<@&(\d{17,19})>/);
        if (!id) return null;
        return message.guild.roles.cache.get(id[1]) || null;
    },

    emoji: (message, phrase) => {
        if (!phrase) return null;
        const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
        if (!id) return null;
        return message.guild.emojis.cache.get(id[1]) || null;
    }
};

module.exports = {
    string: ({ case: casing } = {}) => (message, phrase) => {
        if (!phrase) return null;
        return casing
            ? casing === 'low'
                ? phrase.toLowerCase()
                : phrase.toUpperCase()
            : phrase;
    },

    charCodes: () => (message, phrase) => {
        if (!phrase) return null;
        const codes = [];
        for (const char of phrase) codes.push(char.charCodeAt(0));
        return codes;
    },

    number: ({ type } = {}) => (message, phrase) => {
        if (!phrase || isNaN(phrase)) return null;
        if (type === 'integer') {
            return parseInt(phrase);
        } else if (type === 'bigint') {
            return BigInt(phrase); // eslint-disable-line no-undef, new-cap
        } else if (type === 'emojint') {
            const n = phrase.replace(/0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟/g, m => {
                return ['0⃣', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'].indexOf(m);
            });
            if (isNaN(n)) return null;
            return parseInt(n);
        }
        return parseFloat(phrase);
    },

    url: () => (message, phrase) => {
        if (!phrase) return null;
        if (/^<.+>$/.test(phrase)) phrase = phrase.slice(1, -1);

        try {
            return new URL(phrase);
        } catch (err) {
            return null;
        }
    },

    date: () => (message, phrase) => {
        if (!phrase) return null;
        const timestamp = Date.parse(phrase);
        if (isNaN(timestamp)) return null;
        return new Date(timestamp);
    },

    color: () => (message, phrase) => {
        if (!phrase) return null;

        const color = parseInt(phrase.replace('#', ''), 16);
        if (color < 0 || color > 0xFFFFFF || isNaN(color)) {
            return null;
        }

        return color;
    },

    user: () => (message, phrase) => {
        if (!phrase) return null;
        return message.client.util.resolveUser(phrase, message.client.users.cache);
    },

    users: () => (message, phrase) => {
        if (!phrase) return null;
        const users = message.client.util.resolveUsers(phrase, message.client.users.cache);
        return users.size ? users : null;
    },

    member: () => (message, phrase) => {
        if (!phrase) return null;
        return message.client.util.resolveMember(phrase, message.guild.members.cache);
    },

    members: () => (message, phrase) => {
        if (!phrase) return null;
        const members = message.client.util.resolveMembers(phrase, message.guild.members.cache);
        return members.size ? members : null;
    },

    relevant: () => (message, phrase) => {
        if (!phrase) return null;

        const person = message.channel.type === 'text'
            ? message.client.util.resolveMember(phrase, message.guild.members.cache)
            : message.channel.type === 'dm'
                ? message.client.util.resolveUser(phrase, new Collection([
                    [message.channel.recipient.id, message.channel.recipient],
                    [message.client.user.id, message.client.user]
                ]))
                : message.client.util.resolveUser(phrase, new Collection([
                    [message.client.user.id, message.client.user]
                ]).concat(message.channel.recipients));

        if (!person) return null;
        if (message.channel.type === 'text') return person.user;
        return person;
    },

    relevants: () => (message, phrase) => {
        if (!phrase) return null;

        const persons = message.channel.type === 'text'
            ? message.client.util.resolveMembers(phrase, message.guild.members.cache)
            : message.channel.type === 'dm'
                ? message.client.util.resolveUsers(phrase, new Collection([
                    [message.channel.recipient.id, message.channel.recipient],
                    [message.client.user.id, message.client.user]
                ]))
                : message.client.util.resolveUsers(phrase, new Collection([
                    [message.client.user.id, message.client.user]
                ]).concat(message.channel.recipients));

        if (!persons.size) return null;

        if (message.channel.type === 'text') {
            return persons.map(member => member.user);
        }

        return persons;
    },

    channel: ({ type } = {}) => (message, phrase) => {
        if (!phrase) return null;

        const channel = message.client.util.resolveChannel(phrase, message.guild.channels.cache);
        if (!channel) return null;
        if (type && channel.type !== type) return null;

        return channel;
    },

    channels: ({ type } = {}) => (message, phrase) => {
        if (!phrase) return null;

        const channels = message.client.util.resolveChannels(phrase, message.guild.channels.cache);
        if (!channels.size) return null;
        if (!type) return channels;

        const filtered = channels.filter(c => c.type === type);
        return filtered.size ? filtered : null;
    },

    role: () => (message, phrase) => {
        if (!phrase) return null;
        return message.client.util.resolveRole(phrase, message.guild.roles.cache);
    },

    roles: () => (message, phrase) => {
        if (!phrase) return null;
        const roles = message.client.util.resolveRoles(phrase, message.guild.roles.cache);
        return roles.size ? roles : null;
    },

    emoji: () => (message, phrase) => {
        if (!phrase) return null;
        return message.client.util.resolveEmoji(phrase, message.guild.emojis.cache);
    },

    emojis: () => (message, phrase) => {
        if (!phrase) return null;
        const emojis = message.client.util.resolveEmojis(phrase, message.guild.emojis.cache);
        return emojis.size ? emojis : null;
    },

    guild: () => (message, phrase) => {
        if (!phrase) return null;
        return message.client.util.resolveGuild(phrase, message.client.guilds.cache);
    },

    guilds: () => (message, phrase) => {
        if (!phrase) return null;
        const guilds = message.client.util.resolveGuilds(phrase, message.client.guilds.cache);
        return guilds.size ? guilds : null;
    },

    message: ({ type } = {}) => async (message, phrase) => {
        if (!phrase) return null;

        if (type === 'guild') {
            for (const channel of message.guild.channels.cache.values()) {
                if (channel.type !== 'text') continue;
                try {
                    return await channel.messages.fetch(phrase);
                } catch (err) {
                    if (/^Invalid Form Body/.test(err.message)) return null;
                }
            }
            return null;
        } else if (type === 'relevant') {
            if (!phrase) return null;
            const hereMsg = await message.channel.messages.fetch(phrase).catch(() => null);
            if (hereMsg) return hereMsg;

            if (message.guild) {
                for (const channel of message.guild.channels.cache.values()) {
                    if (channel.type !== 'text') continue;
                    try {
                        return channel.messages.fetch(phrase);
                    } catch (err) {
                        if (/^Invalid Form Body/.test(err.message)) return null;
                    }
                }
            }

            return null;
        }
        return message.channel.messages.fetch(phrase).catch(() => null);
    },

    invite: () => (message, phrase) => {
        if (!phrase) return null;
        return message.client.fetchInvite(phrase).catch(() => null);
    },

    mention: ({ type } = {}) => {
        if (!type || !mentionTypes[type]) {
            throw new AkairoError('UNKNOWN_MENTION_TYPE', type);
        }
        return mentionTypes[type];
    },

    akairoModule: ({ handler }) => (message, phrase) => {
        if (!phrase) return null;
        return handler.modules.get(phrase) || null;
    },

    commandAlias: ({ handler }) => (message, phrase) => {
        if (!phrase) return null;
        return handler.findCommand(phrase) || null;
    }
};
