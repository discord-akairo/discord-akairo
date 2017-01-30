const { Constants } = require('discord.js');

class ClientUtil {
    /**
     * Client utilities to help with common tasks. Accessible in client.util.
     * @param {Client} client - The Discord.js client.
     */
    constructor(client){
        /**
         * The Discord.js client.
         * @readonly
         * @type {Client}
         */
        this.client = client;
    }

    /**
     * Array of permission names.
     * @type {string[]}
     */
    get permissionNames(){
        return Object.keys(Constants.PermissionFlags);
    }

    /**
     * Resolves a User from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {User}
     */
    resolveUser(text, caseSensitive = false, wholeWord = false){
        const users = this.client.users;

        const reg = /<@!?(\d+)>/;
        if (reg.test(text)){
            const id = text.match(reg)[1];
            return users.get(id);
        }

        const check = u => {
            const username = caseSensitive ? u.username : u.username.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return username === t || username === t.split('#')[0] && u.discriminator === t.split('#')[1];
        };

        const checkInc = u => {
            const username = caseSensitive ? u.username : u.username.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return username.includes(t) || username.includes(t.split('#')[0]) && u.discriminator.includes(t.split('#')[1]);
        };

        return users.get(text) || users.find(check) || (!wholeWord ? users.find(checkInc) : null);
    }

    /**
     * Resolves a GuildMember from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} [guild] - Guild to find member in. If not specified, will resolve a User instead.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {GuildMember|User}
     */
    resolveMember(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) return this.resolveUser(text);

        const members = guild.members;

        const reg = /<@!?(\d+)>/;
        if (reg.test(text)){
            const id = text.match(reg)[1];
            return members.get(id);
        }

        const check = m => {
            const username = caseSensitive ? m.user.username : m.user.username.toLowerCase();
            const displayName = caseSensitive ? m.displayName : m.displayName.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return displayName === t || username === t || username === t.split('#')[0] && m.user.discriminator === t.split('#')[1];
        };

        const checkInc = m => {
            const username = caseSensitive ? m.user.username : m.user.username.toLowerCase();
            const displayName = caseSensitive ? m.displayName : m.displayName.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return displayName.includes(t) || username.includes(t) || username.includes(t.split('#')[0]) && m.user.discriminator.includes(t.split('#')[1]);
        };

        return members.get(text) || members.find(check) || (!wholeWord ? members.find(checkInc) : null);
    }

    /**
     * Resolves a GuildChannel from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find channel in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {GuildChannel}
     */
    resolveChannel(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');

        const channels = guild.channels;

        const reg = /<#(\d+)>/;
        if (reg.test(text)){
            const id = text.match(reg)[1];
            return channels.get(id);
        }

        const check = c => {
            const name = caseSensitive ? c.name : c.name.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return name === t || name === t.replace(/^#/, '');
        };

        const checkInc = c => {
            const name = caseSensitive ? c.name : c.name.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return name.includes(t) || name.includes(t.replace(/^#/, ''));
        };

        return channels.get(text) || channels.find(check) || (!wholeWord ? channels.find(checkInc) : null);
    }

    /**
     * Resolves a Role from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find channel in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Role}
     */
    resolveRole(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');

        const roles = guild.roles;

        const reg = /<@&(\d+)>/;
        if (reg.test(text)){
            const id = text.match(reg)[1];
            return roles.get(id);
        }

        const check = r => {
            const name = caseSensitive ? r.name : r.name.toLowerCase();
            const t = caseSensitive ? t : text.toLowerCase();

            return name === t || name === t.replace(/^@/, '');
        };

        const checkInc = r => {
            const name = caseSensitive ? r.name : r.name.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return name.includes(t) || name.includes(t.replace(/^@/, ''));
        };

        return roles.get(text) || roles.find(check) || (!wholeWord ? roles.find(checkInc) : null);
    }

    /**
     * Resolves a custom Emoji from a string, such as a name or a mention.
     * @param {string} text - Text to resolve.
     * @param {Guild} guild - Guild to find emoji in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Emoji}
     */
    resolveEmoji(text, guild, caseSensitive = false, wholeWord = false){
        if (!guild) throw new Error('Guild must be specified.');

        const emojis = guild.emojis;

        const reg = /<:[a-zA-Z0-9_]+:(\d+)>/;
        if (reg.test(text)){
            const id = text.match(reg)[1];
            return emojis.get(id);
        }

        const check = e => {
            const name = caseSensitive ? e.name : e.name.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return name === t || name === t.replace(/:/g, '');
        };

        const checkInc = e => {
            const name = caseSensitive ? e.name : e.name.toLowerCase();
            const t = caseSensitive ? text : text.toLowerCase();

            return name.includes(t) || name.includes(t.replace(/:/g, ''));
        };

        return emojis.get(text) || emojis.find(check) || (!wholeWord ? emojis.find(checkInc) : null);
    }

    /**
     * Resolves a Guild from a string, such as an ID or a name.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {Guild}
     */
    resolveGuild(text, caseSensitive = false, wholeWord = false){
        const guilds = this.client.guilds;

        const check = g => {
            const name = caseSensitive ? g.name : g.name.toLowerCase();
            const t = caseSensitive ? t : text.toLowerCase();

            return name === t;
        };

        const checkInc = g => {
            const name = caseSensitive ? g.name : g.name.toLowerCase();
            const t = caseSensitive ? t : text.toLowerCase();

            return name.includes(t);
        };

        return guilds.get(text) || guilds.find(check) || (!wholeWord ? guilds.find(checkInc) : null);
    }

    /**
     * Gets the display color in decimal of the member.
     * @param {GuildMember} member - The member to find color of.
     * @returns {number}
     */
    displayColor(member){
        const roles = member.roles.filter(r => r.color !== 0);
        if (!roles.size) return 0;

        const highest = roles.array().sort((a, b) => b.comparePositionTo(a))[0];
        return highest.color;
    }

    /**
     * Gets the display color in hex code of the member.
     * @param {GuildMember} member - The member to find color of.
     * @returns {string}
     */
    displayHexColor(member){
        const roles = member.roles.filter(r => r.color !== 0);
        if (!roles.size) return 0;

        const highest = roles.array().sort((a, b) => b.comparePositionTo(a))[0];
        return highest.hexColor;
    }

    /**
     * Creates an invite link for the client.
     * @deprecated Use client.generateInvite(). When was that added!?
     * @param {(number|PermissionResolvable[])} [permissions=0] - Permissions number or array of PermissionResolvables.
     * @return {Promise.<string>}
     */
    createInvite(permissions = 0){
        return new Promise((resolve, reject) => {
            const perms = typeof permissions === 'number' ? permissions : this.client.resolver.resolvePermissions(permissions);

            this.client.fetchApplication().then(app => {
                const invite = `https://discordapp.com/oauth2/authorize?permissions=${perms}&scope=bot&client_id=${app.id}`;
                resolve(invite);
            }).catch(reject);
        });
    }

    /**
     * Resolves a permission number and returns an array of permission names.
     * @param {number} number - The permissions number.
     * @returns {string[]}
     */
    resolvePermissionNumber(number){
        const resolved = [];

        Object.keys(Constants.PermissionFlags).forEach(key => {
            if (number & Constants.PermissionFlags[key]) resolved.push(key);
        });

        return resolved;
    }

    /**
     * Resolves a channel permission overwrite. Returns an object with the allowed and denied arrays of permission names.
     * @param {PermissionOverwrites} overwrite - Permissions overwrite.
     * @returns {Object}
     */
    resolvePermissionOverwrite(overwrite){
        return {
            allowed: this.resolvePermissionNumber(overwrite.allow),
            denied: this.resolvePermissionNumber(overwrite.deny),
        };
    }

    /**
     * Compares two member objects presences and checks if they started/stopped a stream or not. Returns 'started', 'stopped', or false if no change.
     * @param {GuildMember} oldMember - The old member.
     * @param {GuildMember} newMember - The new member.
     * @returns {string|boolean}
     */
    compareStreaming(oldMember, newMember){
        const s1 = oldMember.presence.game && oldMember.presence.game.streaming;
        const s2 = newMember.presence.game && newMember.presence.game.streaming;

        if (s1 === s2) return false;
        if (s1) return 'stopped';
        if (s2) return 'started';
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
}

module.exports = ClientUtil;