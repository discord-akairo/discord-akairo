const { ArgumentTypes } = require('../../../util/Constants');
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
         * @type {AkairoClient}
         */
        this.client = handler.client;

        /**
         * The command handler.
         * @type {CommandHandler}
         */
        this.commandHandler = handler;

        /**
         * The inhibitor handler.
         * @type {InhibitorHandler}
         */
        this.inhibitorHandler = null;

        /**
         * The listener handler.
         * @type {ListenerHandler}
         */
        this.listenerHandler = null;

        /**
         * Collection of types.
         * @type {Collection<string, ArgumentTypeCaster>}
         */
        this.types = new Collection();

        this.addBuiltInTypes();
    }

    /**
     * Adds built-in types.
     * @returns {void}
     */
    addBuiltInTypes() {
        const builtins = {
            [ArgumentTypes.STRING]: (message, phrase) => {
                return phrase || null;
            },

            [ArgumentTypes.LOWERCASE]: (message, phrase) => {
                return phrase ? phrase.toLowerCase() : null;
            },

            [ArgumentTypes.UPPERCASE]: (message, phrase) => {
                return phrase ? phrase.toUpperCase() : null;
            },

            [ArgumentTypes.CHAR_CODES]: (message, phrase) => {
                if (!phrase) return null;
                const codes = [];
                for (const char of phrase) codes.push(char.charCodeAt(0));
                return codes;
            },

            [ArgumentTypes.NUMBER]: (message, phrase) => {
                if (!phrase || isNaN(phrase)) return null;
                return parseFloat(phrase);
            },

            [ArgumentTypes.INTEGER]: (message, phrase) => {
                if (!phrase || isNaN(phrase)) return null;
                return parseInt(phrase);
            },

            [ArgumentTypes.BIGINT]: (message, phrase) => {
                if (!phrase || isNaN(phrase)) return null;
                return BigInt(phrase); // eslint-disable-line no-undef, new-cap
            },

            // Just for fun.
            [ArgumentTypes.EMOJINT]: (message, phrase) => {
                if (!phrase) return null;
                const n = phrase.replace(/0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟/g, m => {
                    return ['0⃣', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'].indexOf(m);
                });

                if (isNaN(n)) return null;
                return parseInt(n);
            },

            [ArgumentTypes.URL]: (message, phrase) => {
                if (!phrase) return null;
                if (/^<.+>$/.test(phrase)) phrase = phrase.slice(1, -1);

                try {
                    return new URL(phrase);
                } catch (err) {
                    return null;
                }
            },

            [ArgumentTypes.DATE]: (message, phrase) => {
                if (!phrase) return null;
                const timestamp = Date.parse(phrase);
                if (isNaN(timestamp)) return null;
                return new Date(timestamp);
            },

            [ArgumentTypes.COLOR]: (message, phrase) => {
                if (!phrase) return null;

                const color = parseInt(phrase.replace('#', ''), 16);
                if (color < 0 || color > 0xFFFFFF || isNaN(color)) {
                    return null;
                }

                return color;
            },

            [ArgumentTypes.USER]: (message, phrase) => {
                if (!phrase) return null;
                return TypeResolver.resolveUser(phrase, this.client.users.cache);
            },

            [ArgumentTypes.USERS]: (message, phrase) => {
                if (!phrase) return null;
                const users = TypeResolver.resolveUsers(phrase, this.client.users.cache);
                return users.size ? users : null;
            },

            [ArgumentTypes.MEMBER]: (message, phrase) => {
                if (!phrase) return null;
                return TypeResolver.resolveMember(phrase, message.guild.members.cache);
            },

            [ArgumentTypes.MEMBERS]: (message, phrase) => {
                if (!phrase) return null;
                const members = TypeResolver.resolveMembers(phrase, message.guild.members.cache);
                return members.size ? members : null;
            },

            [ArgumentTypes.RELEVANT]: (message, phrase) => {
                if (!phrase) return null;

                const person = message.channel.type === 'text'
                    ? TypeResolver.resolveMember(phrase, message.guild.members.cache)
                    : message.channel.type === 'dm'
                        ? TypeResolver.resolveUser(phrase, new Collection([
                            [message.channel.recipient.id, message.channel.recipient],
                            [this.client.user.id, this.client.user]
                        ]))
                        : TypeResolver.resolveUser(phrase, new Collection([
                            [this.client.user.id, this.client.user]
                        ]).concat(message.channel.recipients));

                if (!person) return null;
                if (message.channel.type === 'text') return person.user;
                return person;
            },

            [ArgumentTypes.RELEVANTS]: (message, phrase) => {
                if (!phrase) return null;

                const persons = message.channel.type === 'text'
                    ? TypeResolver.resolveMembers(phrase, message.guild.members.cache)
                    : message.channel.type === 'dm'
                        ? TypeResolver.resolveUsers(phrase, new Collection([
                            [message.channel.recipient.id, message.channel.recipient],
                            [this.client.user.id, this.client.user]
                        ]))
                        : TypeResolver.resolveUsers(phrase, new Collection([
                            [this.client.user.id, this.client.user]
                        ]).concat(message.channel.recipients));

                if (!persons.size) return null;

                if (message.channel.type === 'text') {
                    return persons.map(member => member.user);
                }

                return persons;
            },

            [ArgumentTypes.CHANNEL]: (message, phrase) => {
                if (!phrase) return null;
                return TypeResolver.resolveChannel(phrase, message.guild.channels.cache);
            },

            [ArgumentTypes.CHANNELS]: (message, phrase) => {
                if (!phrase) return null;
                const channels = TypeResolver.resolveChannels(phrase, message.guild.channels.cache);
                return channels.size ? channels : null;
            },

            [ArgumentTypes.TEXT_CHANNEL]: (message, phrase) => {
                if (!phrase) return null;

                const channel = TypeResolver.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== 'text') return null;

                return channel;
            },

            [ArgumentTypes.TEXT_CHANNELS]: (message, phrase) => {
                if (!phrase) return null;

                const channels = TypeResolver.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size) return null;

                const textChannels = channels.filter(c => c.type === 'text');
                return textChannels.size ? textChannels : null;
            },

            [ArgumentTypes.VOICE_CHANNEL]: (message, phrase) => {
                if (!phrase) return null;

                const channel = TypeResolver.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== 'voice') return null;

                return channel;
            },

            [ArgumentTypes.VOICE_CHANNELS]: (message, phrase) => {
                if (!phrase) return null;

                const channels = TypeResolver.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size) return null;

                const voiceChannels = channels.filter(c => c.type === 'voice');
                return voiceChannels.size ? voiceChannels : null;
            },

            [ArgumentTypes.CATEGORY_CHANNEL]: (message, phrase) => {
                if (!phrase) return null;

                const channel = TypeResolver.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== 'category') return null;

                return channel;
            },

            [ArgumentTypes.CATEGORY_CHANNELS]: (message, phrase) => {
                if (!phrase) return null;

                const channels = TypeResolver.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size) return null;

                const categoryChannels = channels.filter(c => c.type === 'category');
                return categoryChannels.size ? categoryChannels : null;
            },

            [ArgumentTypes.NEWS_CHANNEL]: (message, phrase) => {
                if (!phrase) return null;

                const channel = TypeResolver.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== 'news') return null;

                return channel;
            },

            [ArgumentTypes.NEWS_CHANNELS]: (message, phrase) => {
                if (!phrase) return null;

                const channels = TypeResolver.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size) return null;

                const newsChannels = channels.filter(c => c.type === 'news');
                return newsChannels.size ? newsChannels : null;
            },

            [ArgumentTypes.STORE_CHANNEL]: (message, phrase) => {
                if (!phrase) return null;

                const channel = TypeResolver.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== 'store') return null;

                return channel;
            },

            [ArgumentTypes.STORE_CHANNELS]: (message, phrase) => {
                if (!phrase) return null;

                const channels = TypeResolver.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size) return null;

                const storeChannels = channels.filter(c => c.type === 'store');
                return storeChannels.size ? storeChannels : null;
            },

            [ArgumentTypes.ROLE]: (message, phrase) => {
                if (!phrase) return null;
                return TypeResolver.resolveRole(phrase, message.guild.roles.cache);
            },

            [ArgumentTypes.ROLES]: (message, phrase) => {
                if (!phrase) return null;
                const roles = TypeResolver.resolveRoles(phrase, message.guild.roles.cache);
                return roles.size ? roles : null;
            },

            [ArgumentTypes.EMOJI]: (message, phrase) => {
                if (!phrase) return null;
                return TypeResolver.resolveEmoji(phrase, message.guild.emojis.cache);
            },

            [ArgumentTypes.EMOJIS]: (message, phrase) => {
                if (!phrase) return null;
                const emojis = TypeResolver.resolveEmojis(phrase, message.guild.emojis.cache);
                return emojis.size ? emojis : null;
            },

            [ArgumentTypes.GUILD]: (message, phrase) => {
                if (!phrase) return null;
                return TypeResolver.resolveGuild(phrase, this.client.guilds.cache);
            },

            [ArgumentTypes.GUILDS]: (message, phrase) => {
                if (!phrase) return null;
                const guilds = TypeResolver.resolveGuilds(phrase, this.client.guilds.cache);
                return guilds.size ? guilds : null;
            },

            [ArgumentTypes.MESSAGE]: (message, phrase) => {
                if (!phrase) return null;
                return message.channel.messages.fetch(phrase).catch(() => null);
            },

            [ArgumentTypes.GUILD_MESSAGE]: async (message, phrase) => {
                if (!phrase) return null;
                for (const channel of message.guild.channels.cache.values()) {
                    if (channel.type !== 'text') continue;
                    try {
                        return await channel.messages.fetch(phrase);
                    } catch (err) {
                        if (/^Invalid Form Body/.test(err.message)) return null;
                    }
                }

                return null;
            },

            [ArgumentTypes.RELEVANT_MESSAGE]: async (message, phrase) => {
                if (!phrase) return null;
                const hereMsg = await message.channel.messages.fetch(phrase).catch(() => null);
                if (hereMsg) {
                    return hereMsg;
                }

                if (message.guild) {
                    for (const channel of message.guild.channels.cache.values()) {
                        if (channel.type !== 'text') continue;
                        try {
                            return await channel.messages.fetch(phrase);
                        } catch (err) {
                            if (/^Invalid Form Body/.test(err.message)) return null;
                        }
                    }
                }

                return null;
            },

            [ArgumentTypes.INVITE]: (message, phrase) => {
                if (!phrase) return null;
                return this.client.fetchInvite(phrase).catch(() => null);
            },

            [ArgumentTypes.USER_MENTION]: (message, phrase) => {
                if (!phrase) return null;
                const id = phrase.match(/<@!?(\d{17,19})>/);
                if (!id) return null;
                return this.client.users.cache.get(id[1]) || null;
            },

            [ArgumentTypes.MEMBER_MENTION]: (message, phrase) => {
                if (!phrase) return null;
                const id = phrase.match(/<@!?(\d{17,19})>/);
                if (!id) return null;
                return message.guild.members.cache.get(id[1]) || null;
            },

            [ArgumentTypes.CHANNEL_MENTION]: (message, phrase) => {
                if (!phrase) return null;
                const id = phrase.match(/<#(\d{17,19})>/);
                if (!id) return null;
                return message.guild.channels.cache.get(id[1]) || null;
            },

            [ArgumentTypes.ROLE_MENTION]: (message, phrase) => {
                if (!phrase) return null;
                const id = phrase.match(/<@&(\d{17,19})>/);
                if (!id) return null;
                return message.guild.roles.cache.get(id[1]) || null;
            },

            [ArgumentTypes.EMOJI_MENTION]: (message, phrase) => {
                if (!phrase) return null;
                const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
                if (!id) return null;
                return message.guild.emojis.cache.get(id[1]) || null;
            },

            [ArgumentTypes.COMMAND_ALIAS]: (message, phrase) => {
                if (!phrase) return null;
                return this.commandHandler.findCommand(phrase) || null;
            },

            [ArgumentTypes.COMMAND]: (message, phrase) => {
                if (!phrase) return null;
                return this.commandHandler.modules.get(phrase) || null;
            },

            [ArgumentTypes.INHIBITOR]: (message, phrase) => {
                if (!phrase) return null;
                return this.inhibitorHandler.modules.get(phrase) || null;
            },

            [ArgumentTypes.LISTENER]: (message, phrase) => {
                if (!phrase) return null;
                return this.listenerHandler.modules.get(phrase) || null;
            }
        };

        for (const [key, value] of Object.entries(builtins)) {
            this.types.set(key, value);
        }
    }

    /**
     * Gets the resolver function for a type.
     * @param {string} name - Name of type.
     * @returns {ArgumentTypeCaster}
     */
    type(name) {
        return this.types.get(name);
    }

    /**
     * Adds a new type.
     * @param {string} name - Name of the type.
     * @param {ArgumentTypeCaster} fn - Function that casts the type.
     * @returns {TypeResolver}
     */
    addType(name, fn) {
        this.types.set(name, fn);
        return this;
    }

    /**
     * Adds multiple new types.
     * @param {Object} types  - Object with keys as the type name and values as the cast function.
     * @returns {TypeResolver}
     */
    addTypes(types) {
        for (const [key, value] of Object.entries(types)) {
            this.addType(key, value);
        }

        return this;
    }

    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, User>} users - Collection of users to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {User}
     */
    static resolveUser(text, users, caseSensitive = false, wholeWord = false) {
        return users.get(text) || users.find(user => this.checkUser(text, user, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple users from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, User>} users - Collection of users to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection<Snowflake, User>}
     */
    static resolveUsers(text, users, caseSensitive = false, wholeWord = false) {
        return users.filter(user => this.checkUser(text, user, caseSensitive, wholeWord));
    }

    /**
     * Checks if a string could be referring to a user.
     * @param {string} text - Text to check.
     * @param {User} user - User to check.
     * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
     * @returns {boolean}
     */
    static checkUser(text, user, caseSensitive = false, wholeWord = false) {
        if (user.id === text) return true;

        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);

        if (match && user.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive ? user.username : user.username.toLowerCase();
        const discrim = user.discriminator;

        if (!wholeWord) {
            return username.includes(text)
            || (username.includes(text.split('#')[0]) && discrim.includes(text.split('#')[1]));
        }

        return username === text
        || (username === text.split('#')[0] && discrim === text.split('#')[1]);
    }

    /**
     * Resolves a member from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, GuildMember>} members - Collection of members to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {GuildMember}
     */
    static resolveMember(text, members, caseSensitive = false, wholeWord = false) {
        return members.get(text) || members.find(member => this.checkMember(text, member, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple members from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, GuildMember>} members - Collection of members to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection<Snowflake, GuildMember>}
     */
    static resolveMembers(text, members, caseSensitive = false, wholeWord = false) {
        return members.filter(member => this.checkMember(text, member, caseSensitive, wholeWord));
    }

    /**
     * Checks if a string could be referring to a member.
     * @param {string} text - Text to check.
     * @param {GuildMember} member - Member to check.
     * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
     * @returns {boolean}
     */
    static checkMember(text, member, caseSensitive = false, wholeWord = false) {
        if (member.id === text) return true;

        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);

        if (match && member.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
        const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
        const discrim = member.user.discriminator;

        if (!wholeWord) {
            return displayName.includes(text)
            || username.includes(text)
            || ((username.includes(text.split('#')[0]) || displayName.includes(text.split('#')[0])) && discrim.includes(text.split('#')[1]));
        }

        return displayName === text
        || username === text
        || ((username === text.split('#')[0] || displayName === text.split('#')[0]) && discrim === text.split('#')[1]);
    }

    /**
     * Resolves a channel from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Channel>} channels - Collection of channels to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Channel}
     */
    static resolveChannel(text, channels, caseSensitive = false, wholeWord = false) {
        return channels.get(text) || channels.find(channel => this.checkChannel(text, channel, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple channels from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Channel>} channels - Collection of channels to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection<Snowflake, Channel>}
     */
    static resolveChannels(text, channels, caseSensitive = false, wholeWord = false) {
        return channels.filter(channel => this.checkChannel(text, channel, caseSensitive, wholeWord));
    }

    /**
     * Checks if a string could be referring to a channel.
     * @param {string} text - Text to check.
     * @param {Channel} channel - Channel to check.
     * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
     * @returns {boolean}
     */
    static checkChannel(text, channel, caseSensitive = false, wholeWord = false) {
        if (channel.id === text) return true;

        const reg = /<#(\d{17,19})>/;
        const match = text.match(reg);

        if (match && channel.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? channel.name : channel.name.toLowerCase();

        if (!wholeWord) {
            return name.includes(text)
            || name.includes(text.replace(/^#/, ''));
        }

        return name === text
        || name === text.replace(/^#/, '');
    }

    /**
     * Resolves a role from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Role>} roles - Collection of roles to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Role}
     */
    static resolveRole(text, roles, caseSensitive = false, wholeWord = false) {
        return roles.get(text) || roles.find(role => this.checkRole(text, role, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple roles from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Role>} roles - Collection of roles to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection<Snowflake, Role>}
     */
    static resolveRoles(text, roles, caseSensitive = false, wholeWord = false) {
        return roles.filter(role => this.checkRole(text, role, caseSensitive, wholeWord));
    }

    /**
     * Checks if a string could be referring to a role.
     * @param {string} text - Text to check.
     * @param {Role} role - Role to check.
     * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
     * @returns {boolean}
     */
    static checkRole(text, role, caseSensitive = false, wholeWord = false) {
        if (role.id === text) return true;

        const reg = /<@&(\d{17,19})>/;
        const match = text.match(reg);

        if (match && role.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? role.name : role.name.toLowerCase();

        if (!wholeWord) {
            return name.includes(text)
            || name.includes(text.replace(/^@/, ''));
        }

        return name === text
        || name === text.replace(/^@/, '');
    }

    /**
     * Resolves a custom emoji from a string, such as a name or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Emoji>} emojis - Collection of emojis to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Emoji}
     */
    static resolveEmoji(text, emojis, caseSensitive = false, wholeWord = false) {
        return emojis.get(text) || emojis.find(emoji => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple custom emojis from a string, such as a name or a mention.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Emoji>} emojis - Collection of emojis to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection<Snowflake, Emoji>}
     */
    static resolveEmojis(text, emojis, caseSensitive = false, wholeWord = false) {
        return emojis.filter(emoji => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }

    /**
     * Checks if a string could be referring to a emoji.
     * @param {string} text - Text to check.
     * @param {Emoji} emoji - Emoji to check.
     * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
     * @returns {boolean}
     */
    static checkEmoji(text, emoji, caseSensitive = false, wholeWord = false) {
        if (emoji.id === text) return true;

        const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
        const match = text.match(reg);

        if (match && emoji.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? emoji.name : emoji.name.toLowerCase();

        if (!wholeWord) {
            return name.includes(text)
            || name.includes(text.replace(/:/, ''));
        }

        return name === text
        || name === text.replace(/:/, '');
    }

    /**
     * Resolves a guild from a string, such as an ID or a name.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Guild>} guilds - Collection of guilds to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Guild}
     */
    static resolveGuild(text, guilds, caseSensitive = false, wholeWord = false) {
        return guilds.get(text) || guilds.find(guild => this.checkGuild(text, guild, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple guilds from a string, such as an ID or a name.
     * @param {string} text - Text to resolve.
     * @param {Collection<Snowflake, Guild>} guilds - Collection of guilds to find in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection<Snowflake, Guild>}
     */
    static resolveGuilds(text, guilds, caseSensitive = false, wholeWord = false) {
        return guilds.filter(guild => this.checkGuild(text, guild, caseSensitive, wholeWord));
    }

    /**
     * Checks if a string could be referring to a guild.
     * @param {string} text - Text to check.
     * @param {Guild} guild - Guild to check.
     * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
     * @returns {boolean}
     */
    static checkGuild(text, guild, caseSensitive = false, wholeWord = false) {
        if (guild.id === text) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? guild.name : guild.name.toLowerCase();

        if (!wholeWord) return name.includes(text);
        return name === text;
    }
}

module.exports = TypeResolver;
