class ClientUtil {
    /**
     * Creates client utilities.
     * @param {Discord.Client} client The Discord.js client.
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
     * @param {string} text Text to resolve.
     * @returns {Discord.User}
     */
    resolveUser(text){
        let users = this.client.users;

        let reg = /<@!?(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return users.get(id);
        }

        return users.get(text) || users.find(u => {
            return u.username === text
            || u.username.toLowerCase() === text.toLowerCase()
            || u.username === text.split('#')[0] && u.discriminator === text.split('#')[1]
            || u.username.toLowerCase() === text.split('#')[0].toLowerCase() && u.discriminator === text.split('#')[1];
        });
    }

    /**
     * Resolves a GuildMember from a string, such as an ID, a nickname, a username, etc.
     * @param {string} text Text to resolve.
     * @param {Discord.Guild} guild Guild to find member in. If not specified, will resolve a User instead.
     * @returns {(Discord.GuildMember|Discord.User)}
     */
    resolveMember(text, guild){
        if (!guild) return this.resolveUser(text);

        let members = guild.members;

        let reg = /<@!?(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return members.get(id);
        }

        return members.get(text) || members.find(m => {
            return m.displayName === text
            || m.displayName.toLowerCase() === text.toLowerCase()
            || m.user.username === text
            || m.user.username.toLowerCase() === text.toLowerCase()
            || m.user.username === text.split('#')[0] && m.user.discriminator === text.split('#')[1]
            || m.user.username.toLowerCase() === text.split('#')[0].toLowerCase() && m.user.discriminator === text.split('#')[1];
        });
    }

    /**
     * Resolves a GuildChannel from a string, such as an ID, a name, etc.
     * @param {string} text Text to resolve.
     * @param {Discord.Guild} guild Guild to find channel in.
     * @returns {Discord.GuildChannel}
     */
    resolveChannel(text, guild){
        if (!guild) throw new Error('Guild must be specified.');

        let channels = guild.channels;

        let reg = /<#(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return channels.get(id);
        }

        return channels.get(text) || channels.find(c => {
            return c.name === text
            || c.name.toLowerCase() === text.toLowerCase()
            || c.name.replace(/^#/, '') === text
            || c.name.replace(/^#/, '').toLowerCase() === text.toLowerCase();
        });
    }

    /**
     * Resolves a Role from a string, such as an ID, a name, etc.
     * @param {string} text Text to resolve.
     * @param {Discord.Guild} guild Guild to find channel in.
     * @returns {Discord.Role}
     */
    resolveRole(text, guild){
        if (!guild) throw new Error('Guild must be specified.');

        let roles = guild.roles;

        let reg = /<@&(\d+)>/;
        if (reg.test(text)){
            let id = text.match(reg)[1];
            return roles.get(id);
        }

        return roles.get(text) || roles.find(r => {
            return r.name === text
            || r.name.toLowerCase() === text.toLowerCase()
            || r.name.replace(/^@/, '') === text
            || r.name.replace(/^@/, '').toLowerCase() === text.toLowerCase();
        });
    }

    /**
     * Gets the display color in decimal of the member.
     * @param {Discord.GuildMember} member The member to find color of.
     * @returns {number}
     */
    displayColor(member){
        let roles = member.roles.array().sort((a, b) => b.comparePositionTo(a));
        let role = roles.find(r => r.color !== 0);

        return role ? role.color : 0;
    }
}

module.exports = ClientUtil;