class ClientUtil {
    /**
     * Creates client utilities.
     * @param {Discord.Client} client - The Discord.js client.
     */
    constructor(client){
        /** 
         * The Discord.js client. 
         * @type {Discord.Client}
         */
        this.client = client;
    }

    /**
     * Resolves a User from a string, such as an ID, a username, etc.
     * @param {string} text - Text to resolve.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @returns {Discord.User}
     */
    resolveUser(text, caseSensitive = false){
        let users = this.client.users;

        let reg = /<@!?(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return users.get(id);
        }

        let check = u => {
            let username = caseSensitive ? u.username : u.username.toLowerCase();
            let text = caseSensitive ? text : text.toLowerCase();

            return username === text || username === text.split('#')[0] && u.discriminator === text.split('#')[1];
        };

        return users.get(text) || users.find(check);
    }

    /**
     * Resolves a GuildMember from a string, such as an ID, a nickname, a username, etc.
     * @param {string} text - Text to resolve.
     * @param {Discord.Guild} [guild] - Guild to find member in. If not specified, will resolve a User instead.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @returns {(Discord.GuildMember|Discord.User)}
     */
    resolveMember(text, guild, caseSensitive = false){
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
            let text = caseSensitive ? text : text.toLowerCase();

            return displayName === text || username === text || username === text.split('#')[0] && m.user.discriminator === text.split('#')[1];
        };

        return members.get(text) || members.find(check);
    }

    /**
     * Resolves a GuildChannel from a string, such as an ID, a name, etc.
     * @param {string} text - Text to resolve.
     * @param {Discord.Guild} guild - Guild to find channel in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @returns {Discord.GuildChannel}
     */
    resolveChannel(text, guild, caseSensitive = false){
        if (!guild) throw new Error('Guild must be specified.');

        let channels = guild.channels;

        let reg = /<#(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return channels.get(id);
        }

        let check = c => {
            let name = caseSensitive ? c.name : c.name.toLowerCase();
            let text = caseSensitive ? text : text.toLowerCase();

            return name === text || name === text.replace(/^#/, '');
        };

        return channels.get(text) || channels.find(check);
    }

    /**
     * Resolves a Role from a string, such as an ID, a name, etc.
     * @param {string} text - Text to resolve.
     * @param {Discord.Guild} guild - Guild to find channel in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @returns {Discord.Role}
     */
    resolveRole(text, guild, caseSensitive = false){
        if (!guild) throw new Error('Guild must be specified.');

        let roles = guild.roles;

        let reg = /<@&(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return roles.get(id);
        }

        let check = r => {
            let name = caseSensitive ? r.name : r.name.toLowerCase();
            let text = caseSensitive ? text : text.toLowerCase();

            return name === text || name === text.replace(/^@/, '');
        };

        return roles.get(text) || roles.find(check);
    }

    /**
     * Resolves an Emoji from a string, such as a name or a mention.
     * @param {string} text - Text to resolve.
     * @param {Discord.Guild} guild - Guild to find emoji in.
     * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
     * @returns {Discord.Emoji}
     */
    resolveEmoji(text, guild, caseSensitive = false){
        if (!guild) throw new Error('Guild must be specified.');

        let emojis = guild.emojis;

        let reg = /<:[a-zA-Z0-9_]+:(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return emojis.get(id);
        }

        let check = e => {
            let name = caseSensitive ? e.name : e.name.toLowerCase();
            let text = caseSensitive ? text : text.toLowerCase();

            return name === text || name === text.replace(/:/g, '');
        };

        return emojis.get(text) || emojis.find(check);
    }

    /**
     * Gets the display color in decimal of the member.
     * @param {Discord.GuildMember} member - The member to find color of.
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
     * @param {number} [permissions=0] - Permissions number.
     * @return {Promise.<string>}
     */
    createInvite(permissions = 0){
        return new Promise((resolve, reject) => {
            this.client.fetchApplication().then(app => {
                let invite = `https://discordapp.com/oauth2/authorize?permissions=${permissions}&scope=bot&client_id=${app.id}`;
                resolve(invite);
            }).catch(reject);
        });
    }
}

module.exports = ClientUtil;