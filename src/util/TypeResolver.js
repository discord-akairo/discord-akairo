const { ArgumentTypes } = require('./Constants');

class TypeResolver {
    /**
     * Type resolver for command arguments.
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
        const res = val => this.client.util.resolveUser(val, false, true);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.MEMBER](word, def, message){
        const res = val => this.client.util.resolveMember(val, message.guild, false, true);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild, false, true);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.TEXT_CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild, false, true);
        if (!word) return res(def);

        const channel = res(word);
        if (!channel || channel.type !== 'text') return res(def);

        return channel;
    }

    [ArgumentTypes.VOICE_CHANNEL](word, def, message){
        const res = val => this.client.util.resolveChannel(val, message.guild, false, true);
        if (!word) return res(def);

        const channel = res(word);
        if (!channel || channel.type !== 'voice') return res(def);

        return channel;
    }

    [ArgumentTypes.ROLE](word, def, message){
        const res = val => this.client.util.resolveRole(val, message.guild, false, true);
        if (!word) return res(def);
        return res(word) || res(def);
    }

    [ArgumentTypes.EMOJI](word, def, message){
        const res = val => this.client.util.resolveEmoji(val, message.guild, false, true);
        if (!word) return res(def);
        return res(word) || res(def);
    }
}

module.exports = TypeResolver;
