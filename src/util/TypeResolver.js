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
        const res = val => this.client.util.resolveUser(val);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.USERS](word, def){
        const res = val => this.client.util.resolveUsers(val);
        if (!word) return res(def);
        const users = res(word);
        return users.size ? users : res(def);
    }

    [ArgumentTypes.MEMBER](word, def, message){
        const res = val => this.client.util.resolveMember(val, message.guild);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.MEMBERS](word, def, message){
        const res = val => this.client.util.resolveMembers(val, message.guild);
        if (!word) return res(def);
        const members = res(word);
        return members.size ? members : res(def);
    }

    [ArgumentTypes.RELEVANT](word, def, message){
        const res = message.channel.type === 'text'
        ? val => this.client.util.resolveMember(val, message.guild)
        : val => this.client.util.resolveUser(val);

        let person;

        if (!word){
            person = res(def);
        } else {
            person = res(word) || res(def);
        }

        if (!person) return null;
        if (message.channel.type === 'text') return person.user;

        if (message.channel.type === 'dm'){
            if (message.channel.recipient.id === person.id || this.client.user.id === person.id) return person;
        }

        if (message.channel.type === 'group'){
            if (message.channel.recipients.has(person.id) || this.client.user.id === person.id) return person;
        }
    }

    [ArgumentTypes.RELEVANTS](word, def, message){
        const res = message.channel.type === 'text'
        ? val => this.client.util.resolveMembers(val, message.guild)
        : val => this.client.util.resolveUsers(val);

        let persons;

        if (!word){
            persons = res(def);
        } else {
            persons = res(word) || res(def);
        }

        if (!persons.size) return null;
        if (message.channel.type === 'text') return new Collection(persons.map(m => [m.id, m.user]));

        if (message.channel.type === 'dm'){
            return persons.filter(p => message.channel.recipient.id === p.id || this.client.user.id === p.id);
        }

        if (message.channel.type === 'group'){
            return persons.filter(p => message.channel.recipients.has(p.id) || this.client.user.id === p.id);
        }
    }

    [ArgumentTypes.CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.CHANNELS](word, def, message){
        const res = val => this.client.util.resolveChannels(val, message.guild);
        if (!word) return res(def);
        const channels = res(word);
        return channels.size ? channels : res(def);
    }

    [ArgumentTypes.TEXT_CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild);
        if (!word) return res(def);

        const channel = res(word);
        if (!channel || channel.type !== 'text') return res(def);

        return channel;
    }

    [ArgumentTypes.TEXT_CHANNELS](word, def, message){
        const res = val => this.client.util.resolveChannels(val, message.guild);
        if (!word) return res(def);

        const channels = res(word);
        if (!channels.size || channels.every(c => c.type !== 'text')) return res(def);

        return channels.filter(c => c.type === 'text');
    }

    [ArgumentTypes.VOICE_CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild);
        if (!word) return res(def);

        const channel = res(word);
        if (!channel || channel.type !== 'voice') return res(def);

        return channel;
    }

    [ArgumentTypes.VOICE_CHANNELS](word, def, message){
        const res = val => this.client.util.resolveChannels(val, message.guild);
        if (!word) return res(def);

        const channels = res(word);
        if (!channels.size || channels.every(c => c.type !== 'voice')) return res(def);

        return channels.filter(c => c.type === 'voice');
    }

    [ArgumentTypes.ROLE](word, def, message){
        const res = val => this.client.util.resolveRole(val, message.guild);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.ROLES](word, def, message){
        const res = val => this.client.util.resolveRoles(val, message.guild);
        if (!word) return res(def);
        const roles = res(word);
        return roles.size ? roles : res(def);
    }

    [ArgumentTypes.EMOJI](word, def, message){
        const res = val => this.client.util.resolveEmoji(val, message.guild);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.EMOJIS](word, def, message){
        const res = val => this.client.util.resolveEmojis(val, message.guild);
        if (!word) return res(def);
        const emojis = res(word);
        return emojis.size ? emojis : res(def);
    }

    [ArgumentTypes.GUILD](word, def, message){
        const res = val => this.client.util.resolveGuild(val, message.guild);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.GUILDS](word, def, message){
        const res = val => this.client.util.resolveGuilds(val, message.guild);
        if (!word) return res(def);
        const guilds = res(word);
        return guilds.size ? guilds : res(def);
    }
}

module.exports = TypeResolver;
