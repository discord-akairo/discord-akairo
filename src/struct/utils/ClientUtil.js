const Constants = require('discord.js').Constants;

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
     * Resolves a User from a string, such as an ID, a name, or a mention.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
     * @returns {User}
     */
    resolveUser(text, caseSensitive = false, wholeWord = false){
        let users = this.client.users;

        let reg = /<@!?(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return users.get(id);
        }

        let check = u => {
            let username = caseSensitive ? u.username : u.username.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

            return username === t || username === t.split('#')[0] && u.discriminator === t.split('#')[1];
        };

        let checkInc = u => {
            let username = caseSensitive ? u.username : u.username.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

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

        let members = guild.members;

        let reg = /<@!?(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return members.get(id);
        }

        let check = m => {
            let username = caseSensitive ? m.user.username : m.user.username.toLowerCase();
            let displayName = caseSensitive ? m.displayName : m.displayName.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

            return displayName === t || username === t || username === t.split('#')[0] && m.user.discriminator === t.split('#')[1];
        };

        let checkInc = m => {
            let username = caseSensitive ? m.user.username : m.user.username.toLowerCase();
            let displayName = caseSensitive ? m.displayName : m.displayName.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

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

        let channels = guild.channels;

        let reg = /<#(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return channels.get(id);
        }

        let check = c => {
            let name = caseSensitive ? c.name : c.name.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

            return name === t || name === t.replace(/^#/, '');
        };

        let checkInc = c => {
            let name = caseSensitive ? c.name : c.name.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

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

        let roles = guild.roles;

        let reg = /<@&(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return roles.get(id);
        }

        let check = r => {
            let name = caseSensitive ? r.name : r.name.toLowerCase();
            let t = caseSensitive ? t : text.toLowerCase();

            return name === t || name === t.replace(/^@/, '');
        };

        let checkInc = r => {
            let name = caseSensitive ? r.name : r.name.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

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

        let emojis = guild.emojis;

        let reg = /<:[a-zA-Z0-9_]+:(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return emojis.get(id);
        }

        let check = e => {
            let name = caseSensitive ? e.name : e.name.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

            return name === t || name === t.replace(/:/g, '');
        };

        let checkInc = e => {
            let name = caseSensitive ? e.name : e.name.toLowerCase();
            let t = caseSensitive ? text : text.toLowerCase();

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
        let guilds = this.client.guilds;

        let check = g => {
            let name = caseSensitive ? g.name : g.name.toLowerCase();
            let t = caseSensitive ? t : text.toLowerCase();

            return name === t;
        };

        let checkInc = g => {
            let name = caseSensitive ? g.name : g.name.toLowerCase();
            let t = caseSensitive ? t : text.toLowerCase();

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
        let roles = member.roles.filter(r => r.color !== 0);
        if (roles.size === 0) return 0;

        let highest = Math.max(...roles.map(r => r.position));
        return roles.find(r => r.position === highest).color;
    }

    /**
     * Creates an invite link for the client.
     * @param {(number|PermissionResolvable[])} [permissions=0] - Permissions number or array of PermissionResolvables.
     * @return {Promise.<string>}
     */
    createInvite(permissions = 0){
        return new Promise((resolve, reject) => {
            let perms = typeof permissions === 'number' ? permissions : this.client.resolver.resolvePermissions(permissions);

            this.client.fetchApplication().then(app => {
                let invite = `https://discordapp.com/oauth2/authorize?permissions=${perms}&scope=bot&client_id=${app.id}`;
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
        let resolved = [];

        Object.keys(Constants.PermissionFlags).forEach(key => {
            if (number & Constants.PermissionFlags[key]) resolved.push(key);
        });

        return resolved;
    }

    /**
     * Resolves a channel permission overwrite. Returns an object with the `allowed` and `denied` arrays of permission names.
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
     * Compares two member objects presences and checks if they started/stopped a stream or not. Returns `'started'`, `'stopped'`, or false if no change.
     * @param {GuildMember} oldMember - The old member.
     * @param {GuildMember} newMember - The new member.
     * @returns {string}
     */
    compareStreaming(oldMember, newMember){
        let s1 = oldMember.presence.game && oldMember.presence.game.streaming;
        let s2 = newMember.presence.game && newMember.presence.game.streaming;

        if (s1 === s2) return false;
        if (s1) return 'stopped';
        if (s2) return 'started';
    }
}

module.exports = ClientUtil;
