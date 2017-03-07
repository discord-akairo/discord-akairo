const { ArgumentTypes } = require('./Constants');
const { Collection } = require('discord.js');

class TypeResolver {
    /**
     * Type resolver for command arguments.
     * <br>The types are documented under ArgumentType.
     * @param {AkairoClient} client - The client.
     */
    constructor(client){
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

    [ArgumentTypes.STRING](word, def){
        return word || def;
    }

    [ArgumentTypes.NUMBER](word, def){
        if (isNaN(word) || !word) return def;
        return parseFloat(word);
    }

    [ArgumentTypes.INTEGER](word, def){
        if (isNaN(word) || !word) return def;
        return parseInt(word);
    }

    [ArgumentTypes.DYNAMIC](word, def){
        if (!word) return def;
        if (isNaN(word)) return word;
        return parseFloat(word);
    }

    [ArgumentTypes.DYNAMIC_INT](word, def){
        if (!word) return def;
        if (isNaN(word)) return word;
        return parseInt(word);
    }

    [ArgumentTypes.USER](word, def){
        const res = val => this.client.util.resolveUser(val, this.client.users);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.USERS](word, def){
        const res = val => this.client.util.resolveUsers(val, this.client.users);
        if (!word) return res(def);
        const users = res(word);
        return users.size ? users : res(def);
    }

    [ArgumentTypes.MEMBER](word, def, message){
        const res = val => this.client.util.resolveMember(val, message.guild.members);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.MEMBERS](word, def, message){
        const res = val => this.client.util.resolveMembers(val, message.guild.members);
        if (!word) return res(def);
        const members = res(word);
        return members.size ? members : res(def);
    }

    [ArgumentTypes.RELEVANT](word, def, message){
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

        let person;

        if (!word){
            person = res(def);
        } else {
            person = res(word) || res(def);
        }

        if (!person) return null;
        if (message.channel.type === 'text') return person.user;
        return person;
    }

    [ArgumentTypes.RELEVANTS](word, def, message){
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

        let persons;

        if (!word){
            persons = res(def);
        } else {
            persons = res(word) || res(def);
        }

        if (!persons.size) return null;
        if (message.channel.type === 'text') return new Collection(persons.map(m => [m.id, m.user]));
        return persons;
    }

    [ArgumentTypes.CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild.channels);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.CHANNELS](word, def, message){
        const res = val => this.client.util.resolveChannels(val, message.guild.channels);
        if (!word) return res(def);
        const channels = res(word);
        return channels.size ? channels : res(def);
    }

    [ArgumentTypes.TEXT_CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild.channels);
        if (!word) return res(def);

        const channel = res(word);
        if (!channel || channel.type !== 'text') return res(def);

        return channel;
    }

    [ArgumentTypes.TEXT_CHANNELS](word, def, message){
        const res = val => this.client.util.resolveChannels(val, message.guild.channels);
        if (!word) return res(def);

        const channels = res(word);
        if (!channels.size || channels.every(c => c.type !== 'text')) return res(def);

        return channels.filter(c => c.type === 'text');
    }

    [ArgumentTypes.VOICE_CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild.channels);
        if (!word) return res(def);

        const channel = res(word);
        if (!channel || channel.type !== 'voice') return res(def);

        return channel;
    }

    [ArgumentTypes.VOICE_CHANNELS](word, def, message){
        const res = val => this.client.util.resolveChannels(val, message.guild.channels);
        if (!word) return res(def);

        const channels = res(word);
        if (!channels.size || channels.every(c => c.type !== 'voice')) return res(def);

        return channels.filter(c => c.type === 'voice');
    }

    [ArgumentTypes.ROLE](word, def, message){
        const res = val => this.client.util.resolveRole(val, message.guild.roles);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.ROLES](word, def, message){
        const res = val => this.client.util.resolveRoles(val, message.guild.roles);
        if (!word) return res(def);
        const roles = res(word);
        return roles.size ? roles : res(def);
    }

    [ArgumentTypes.EMOJI](word, def, message){
        const res = val => this.client.util.resolveEmoji(val, message.guild.emojis);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.EMOJIS](word, def, message){
        const res = val => this.client.util.resolveEmojis(val, message.guild.emojis);
        if (!word) return res(def);
        const emojis = res(word);
        return emojis.size ? emojis : res(def);
    }

    [ArgumentTypes.GUILD](word, def){
        const res = val => this.client.util.resolveGuild(val, this.client.guilds);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.GUILDS](word, def){
        const res = val => this.client.util.resolveGuilds(val, this.client.guilds);
        if (!word) return res(def);
        const guilds = res(word);
        return guilds.size ? guilds : res(def);
    }
}

module.exports = TypeResolver;
