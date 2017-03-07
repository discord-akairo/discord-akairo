const { Constants, RichEmbed, Collection } = require('discord.js');

class ClientUtil {
    /**
     * Client utilities to help with common tasks.
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

    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {User}
     */
    resolveUser(text, caseSensitive = false, wholeWord = false){
        return this.client.users.find(user => this._checkUser(user, text, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple users from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection.<string, User>}
     */
    resolveUsers(text, caseSensitive = false, wholeWord = false){
        return this.client.users.filter(user => this._checkUser(user, text, caseSensitive, wholeWord));
    }

    _checkUser(user, text, caseSensitive, wholeWord){
        if (user.id === text) return true;

        const reg = /<@!?(\d+)>/;
        const match = text.match(reg);

        if (match && user.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive ? user.username : user.username.toLowerCase();
        const discrim = user.discriminator;

        if (!wholeWord){
            return username.includes(text)
            || username.includes(text.split('#')[0]) && discrim.includes(text.split('#')[1]);
        }

        return username === text
        || username === text.split('#')[0] && discrim === text.split('#')[1];
    }

    /**
     * Resolves a member from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} [guild] - Guild to find member in.<br>If not specified, will resolve a user instead.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {GuildMember|User}
     */
    resolveMember(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) return this.resolveUser(text, caseSensitive, wholeWord);
        return guild.members.find(member => this._checkMember(member, text, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple members from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} [guild] - Guild to find members in.<br>If not specified, will resolve users instead.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection.<string, GuildMember|User>}
     */
    resolveMembers(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) return this.resolveUsers(text, caseSensitive, wholeWord);
        return guild.members.filter(member => this._checkMember(member, text, caseSensitive, wholeWord));
    }

    _checkMember(member, text, caseSensitive, wholeWord){
        if (member.id === text) return true;

        const reg = /<@!?(\d+)>/;
        const match = text.match(reg);

        if (match && member.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
        const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
        const discrim = member.user.discriminator;

        if (!wholeWord){
            return displayName.includes(text)
            || username.includes(text)
            || (username.includes(text.split('#')[0]) || displayName.includes(text.split('#')[0])) && discrim.includes(text.split('#')[1]);
        }

        return displayName === text
        || username === text
        || (username === text.split('#')[0] || displayName === text.split('#')[0]) && discrim === text.split('#')[1];
    }

    /**
     * Resolves a guild channel from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find channel in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {GuildChannel}
     */
    resolveChannel(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');
        return guild.channels.find(channel => this._checkChannel(channel, text, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple guild channels from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find channels in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection.<string, GuildChannel>}
     */
    resolveChannels(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');
        return guild.channels.filter(channel => this._checkChannel(channel, text, caseSensitive, wholeWord));
    }

    _checkChannel(channel, text, caseSensitive, wholeWord){
        if (channel.id === text) return true;

        const reg = /<#(\d+)>/;
        const match = text.match(reg);

        if (match && channel.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? channel.name : channel.name.toLowerCase();

        if (!wholeWord){
            return name.includes(text)
            || name.includes(text.replace(/^#/, ''));
        }

        return name === text
        || name === text.replace(/^#/, '');
    }

    /**
     * Resolves a role from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find roles in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Role}
     */
    resolveRole(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');
        return guild.roles.find(role => this._checkRole(role, text, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple roles from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find roles in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection.<string, Role>}
     */
    resolveRoles(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');
        return guild.roles.filter(role => this._checkRole(role, text, caseSensitive, wholeWord));
    }

    _checkRole(role, text, caseSensitive, wholeWord){
        if (role.id === text) return true;

        const reg = /<@&(\d+)>/;
        const match = text.match(reg);

        if (match && role.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? role.name : role.name.toLowerCase();

        if (!wholeWord){
            return name.includes(text)
            || name.includes(text.replace(/^@/, ''));
        }

        return name === text
        || name === text.replace(/^@/, '');
    }

    /**
     * Resolves a custom emoji from a string, such as a name or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find emoji in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Emoji}
     */
    resolveEmoji(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');
        return guild.emojis.find(emoji => this._checkEmoji(emoji, text, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple custom emojis from a string, such as a name or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find emojis in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection.<string, Emoji>}
     */
    resolveEmojis(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');
        return guild.emojis.filter(emoji => this._checkEmoji(emoji, text, caseSensitive, wholeWord));
    }

    _checkEmoji(emoji, text, caseSensitive, wholeWord){
        if (emoji.id === text) return true;

        const reg = /<:[a-zA-Z0-9_]+:(\d+)>/;
        const match = text.match(reg);

        if (match && emoji.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? emoji.name : emoji.name.toLowerCase();

        if (!wholeWord){
            return name.includes(text)
            || name.includes(text.replace(/:/, ''));
        }

        return name === text
        || name === text.replace(/:/, '');
    }

    /**
     * Resolves a guild from a string, such as an ID or a name.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Guild}
     */
    resolveGuild(text, caseSensitive = false, wholeWord = false){
        return this.client.guilds.find(guild => this._checkGuild(guild, text, caseSensitive, wholeWord));
    }

    /**
     * Resolves multiple guilds from a string, such as an ID or a name.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Collection.<string, Guild>}
     */
    resolveGuilds(text, caseSensitive = false, wholeWord = false){
        return this.client.guilds.filter(guild => this._checkGuild(guild, text, caseSensitive, wholeWord));
    }

    _checkGuild(guild, text, caseSensitive, wholeWord){
        if (guild.id === text) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? guild.name : guild.name.toLowerCase();

        if (!wholeWord) return name.includes(text);
        return name === text;
    }

    /**
     * Gets the role which is used to display the member's color.
     * @param {GuildMember} member - The member to find the role.
     * @returns {Role}
     */
    displayRole(member){
        const coloredRoles = member.roles.filter(role => role.color);
        if (!coloredRoles.size) return null;
        return coloredRoles.reduce((prev, role) => !prev || role.comparePositionTo(prev) > 0 ? role : prev);
    }

    /**
     * Gets the display color in decimal of the member.
     * @param {GuildMember} member - The member to find color of.
     * @returns {number}
     */
    displayColor(member){
        const role = this.displayRole(member);
        return role && role.color || 0;
    }

    /**
     * Gets the display color in hex code of the member.
     * @param {GuildMember} member - The member to find color of.
     * @returns {string}
     */
    displayHexColor(member){
        const role = this.displayRole(member);
        return role && role.hexColor || '#000000';
    }

    /**
     * Gets the role which is used to hoist the member.
     * @param {GuildMember} member - The member to find the role.
     * @returns {Role}
     */
    hoistRole(member){
        const hoistedRoles = member.roles.filter(role => role.hoist);
        if (!hoistedRoles.size) return null;
        return hoistedRoles.reduce((prev, role) => !prev || role.comparePositionTo(prev) > 0 ? role : prev);
    }

    /**
     * Array of permission names.
     * @returns {string[]}
     */
    permissionNames(){
        return Object.keys(Constants.PermissionFlags);
    }

    /**
     * Resolves a permission number and returns an array of permission names.
     * @param {number} number - The permissions number.
     * @returns {string[]}
     */
    resolvePermissionNumber(number){
        const resolved = [];

        for (const key of Object.keys(Constants.PermissionFlags)){
            if (number & Constants.PermissionFlags[key]) resolved.push(key);
        }

        return resolved;
    }

    /**
     * Resolves a channel permission overwrite.<br>Returns an object with the allow and deny arrays of permission names.
     * @param {PermissionOverwrites} overwrite - Permissions overwrite.
     * @returns {Object}
     */
    resolvePermissionOverwrite(overwrite){
        return {
            allow: this.resolvePermissionNumber(overwrite.allow),
            deny: this.resolvePermissionNumber(overwrite.deny),
        };
    }

    /**
     * Compares two member objects presences and checks if they stopped/started a stream or not.<br>Returns 0, 1, or 2 for no change, stopped, or started.
     * @param {GuildMember} oldMember - The old member.
     * @param {GuildMember} newMember - The new member.
     * @returns {number}
     */
    compareStreaming(oldMember, newMember){
        const s1 = oldMember.presence.game && oldMember.presence.game.streaming;
        const s2 = newMember.presence.game && newMember.presence.game.streaming;

        if (s1 === s2) return 0;
        if (s1) return 1;
        if (s2) return 2;
    }

    /**
     * Combination of client.fetchUser() and guild.fetchMember().
     * @param {Guild} guild - Guild to fetch in.
     * @param {string} id - ID of the user.
     * @param {boolean} cache - Whether or not to add to cache.
     * @returns {Promise.<GuildMember>}
     */
    fetchMemberFrom(guild, id, cache){
        return this.client.fetchUser(id, cache).then(fetched => {
            return guild.fetchMember(fetched, cache);
        });
    }

    /**
     * Makes a RichEmbed.
     * @param {Object} [data] - Embed data.
     * @returns {RichEmbed}
     */
    embed(data){
        return new RichEmbed(data);
    }

    /**
     * Makes a Collection.
     * @param {Iterable} [iterable] - Entries to fill with.
     * @returns {Collection}
     */
    collection(iterable){
        return new Collection(iterable);
    }
}

module.exports = ClientUtil;
