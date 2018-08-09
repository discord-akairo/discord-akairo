const { ArgumentTypes } = require('../../../util/Constants');
const { Collection } = require('discord.js');
const Type = require('./Type');
const { URL } = require('url');

const types = {
    [ArgumentTypes.STRING](phrase) {
        return phrase || null;
    },

    [ArgumentTypes.LOWERCASE](phrase) {
        return phrase ? phrase.toLowerCase() : null;
    },

    [ArgumentTypes.UPPERCASE](phrase) {
        return phrase ? phrase.toUpperCase() : null;
    },

    [ArgumentTypes.CHAR_CODES](phrase) {
        if (!phrase) return null;
        const codes = [];
        for (const char of phrase) codes.push(char.charCodeAt(0));
        return codes;
    },

    [ArgumentTypes.NUMBER](phrase) {
        if (!phrase || isNaN(phrase)) return null;
        return parseFloat(phrase);
    },

    [ArgumentTypes.INTEGER](phrase) {
        if (!phrase || isNaN(phrase)) return null;
        return parseInt(phrase);
    },

    [ArgumentTypes.BIGINT](phrase) {
        if (!phrase || isNaN(phrase)) return null;
        return BigInt(phrase); // eslint-disable-line no-undef, new-cap
    },

    [ArgumentTypes.URL](phrase) {
        if (!phrase) return null;
        if (/^<.+>$/.test(phrase)) phrase = phrase.slice(1, -1);

        try {
            return new URL(phrase);
        } catch (err) {
            return null;
        }
    },

    [ArgumentTypes.DATE](phrase) {
        if (!phrase) return null;
        const timestamp = Date.parse(phrase);
        if (isNaN(timestamp)) return null;
        return new Date(timestamp);
    },

    [ArgumentTypes.COLOR](phrase) {
        if (!phrase) return null;

        const color = parseInt(phrase.replace('#', ''), 16);
        if (color < 0 || color > 0xFFFFFF || isNaN(color)) {
            return null;
        }

        return color;
    },

    [ArgumentTypes.USER](phrase) {
        if (!phrase) return null;
        return this.client.util.resolveUser(phrase, this.client.users);
    },

    [ArgumentTypes.USERS](phrase) {
        if (!phrase) return null;
        const users = this.client.util.resolveUsers(phrase, this.client.users);
        return users.size ? users : null;
    },

    [ArgumentTypes.MEMBER](phrase, message) {
        if (!phrase) return null;
        return this.client.util.resolveMember(phrase, message.guild.members);
    },

    [ArgumentTypes.MEMBERS](phrase, message) {
        if (!phrase) return null;
        const members = this.client.util.resolveMembers(phrase, message.guild.members);
        return members.size ? members : null;
    },

    [ArgumentTypes.RELEVANT](phrase, message) {
        if (!phrase) return null;

        const person = message.channel.type === 'text'
            ? this.client.util.resolveMember(phrase, message.guild.members)
            : message.channel.type === 'dm'
                ? this.client.util.resolveUser(phrase, new Collection([
                    [message.channel.recipient.id, message.channel.recipient],
                    [this.client.user.id, this.client.user]
                ]))
                : this.client.util.resolveUser(phrase, new Collection([
                    [this.client.user.id, this.client.user]
                ]).concat(message.channel.recipients));

        if (!person) return null;
        if (message.channel.type === 'text') return person.user;
        return person;
    },

    [ArgumentTypes.RELEVANTS](phrase, message) {
        if (!phrase) return null;

        const persons = message.channel.type === 'text'
            ? this.client.util.resolveMembers(phrase, message.guild.members)
            : message.channel.type === 'dm'
                ? this.client.util.resolveUsers(phrase, new Collection([
                    [message.channel.recipient.id, message.channel.recipient],
                    [this.client.user.id, this.client.user]
                ]))
                : this.client.util.resolveUsers(phrase, new Collection([
                    [this.client.user.id, this.client.user]
                ]).concat(message.channel.recipients));

        if (!persons.size) return null;

        if (message.channel.type === 'text') {
            return persons.map(member => member.user);
        }

        return persons;
    },

    [ArgumentTypes.CHANNEL](phrase, message) {
        if (!phrase) return null;
        return this.client.util.resolveChannel(phrase, message.guild.channels);
    },

    [ArgumentTypes.CHANNELS](phrase, message) {
        if (!phrase) return null;
        const channels = this.client.util.resolveChannels(phrase, message.guild.channels);
        return channels.size ? channels : null;
    },

    [ArgumentTypes.TEXT_CHANNEL](phrase, message) {
        if (!phrase) return null;

        const channel = this.client.util.resolveChannel(phrase, message.guild.channels);
        if (!channel || channel.type !== 'text') return null;

        return channel;
    },

    [ArgumentTypes.TEXT_CHANNELS](phrase, message) {
        if (!phrase) return null;

        const channels = this.client.util.resolveChannels(phrase, message.guild.channels);
        if (!channels.size) return null;

        const textChannels = channels.filter(c => c.type === 'text');
        return textChannels.size ? textChannels : null;
    },

    [ArgumentTypes.VOICE_CHANNEL](phrase, message) {
        if (!phrase) return null;

        const channel = this.client.util.resolveChannel(phrase, message.guild.channels);
        if (!channel || channel.type !== 'voice') return null;

        return channel;
    },

    [ArgumentTypes.VOICE_CHANNELS](phrase, message) {
        if (!phrase) return null;

        const channels = this.client.util.resolveChannels(phrase, message.guild.channels);
        if (!channels.size) return null;

        const voiceChannels = channels.filter(c => c.type === 'voice');
        return voiceChannels.size ? voiceChannels : null;
    },

    [ArgumentTypes.ROLE](phrase, message) {
        if (!phrase) return null;
        return this.client.util.resolveRole(phrase, message.guild.roles);
    },

    [ArgumentTypes.ROLES](phrase, message) {
        if (!phrase) return null;
        const roles = this.client.util.resolveRoles(phrase, message.guild.roles);
        return roles.size ? roles : null;
    },

    [ArgumentTypes.EMOJI](phrase, message) {
        if (!phrase) return null;
        return this.client.util.resolveEmoji(phrase, message.guild.emojis);
    },

    [ArgumentTypes.EMOJIS](phrase, message) {
        if (!phrase) return null;
        const emojis = this.client.util.resolveEmojis(phrase, message.guild.emojis);
        return emojis.size ? emojis : null;
    },

    [ArgumentTypes.GUILD](phrase) {
        if (!phrase) return null;
        return this.client.util.resolveGuild(phrase, this.client.guilds);
    },

    [ArgumentTypes.GUILDS](phrase) {
        if (!phrase) return null;
        const guilds = this.client.util.resolveGuilds(phrase, this.client.guilds);
        return guilds.size ? guilds : null;
    },

    [ArgumentTypes.MESSAGE](phrase, message) {
        if (!phrase) return null;
        return message.channel.messages.fetch(phrase).catch(() => null);
    },

    [ArgumentTypes.GUILD_MESSAGE]: async (phrase, message) => {
        if (!phrase) return null;
        for (const channel of message.guild.channels.values()) {
            if (channel.type !== 'text') continue;
            try {
                // eslint-disable-next-line no-await-in-loop
                return await channel.messages.fetch(phrase);
            } catch (err) {
                if (/^Invalid Form Body/.test(err.message)) return null;
            }
        }

        return null;
    },

    [ArgumentTypes.INVITE](phrase) {
        if (!phrase) return null;
        return this.client.fetchInvite(phrase).catch(() => null);
    },

    [ArgumentTypes.USER_MENTION](phrase) {
        if (!phrase) return null;
        const id = phrase.match(/<@!?(\d{17,19})>/);
        if (!id) return null;
        return this.client.users.get(id[1]) || null;
    },

    [ArgumentTypes.MEMBER_MENTION](phrase, message) {
        if (!phrase) return null;
        const id = phrase.match(/<@!?(\d{17,19})>/);
        if (!id) return null;
        return message.guild.members.get(id[1]) || null;
    },

    [ArgumentTypes.CHANNEL_MENTION](phrase, message) {
        if (!phrase) return null;
        const id = phrase.match(/<#(\d{17,19})>/);
        if (!id) return null;
        return message.guild.channels.get(id[1]) || null;
    },

    [ArgumentTypes.ROLE_MENTION](phrase, message) {
        if (!phrase) return null;
        const id = phrase.match(/<@&(\d{17,19})>/);
        if (!id) return null;
        return message.guild.roles.get(id[1]) || null;
    },

    [ArgumentTypes.EMOJI_MENTION](phrase, message) {
        if (!phrase) return null;
        const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
        if (!id) return null;
        return message.guild.emojis.get(id[1]) || null;
    },

    [ArgumentTypes.COMMAND_ALIAS](phrase) {
        if (!phrase) return null;
        return this.commandHandler.findCommand(phrase) || null;
    },

    [ArgumentTypes.COMMAND](phrase) {
        if (!phrase) return null;
        return this.commandHandler.modules.get(phrase) || null;
    },

    [ArgumentTypes.INHIBITOR](phrase) {
        if (!phrase) return null;
        return this.inhibitorHandler.modules.get(phrase) || null;
    },

    [ArgumentTypes.LISTENER](phrase) {
        if (!phrase) return null;
        return this.listenerHandler.modules.get(phrase) || null;
    }
};

module.exports = Object.entries(types).map(([k, v]) => Type.create(k, v));
