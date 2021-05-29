class AkairoMessage {
    constructor(client, interaction, { slash, replied }) {
        this.interaction = interaction;
        this._message = null;
        this.channel = interaction.guild;
        this.guild = interaction.guild;
        this.member = interaction.member;
        this.author = interaction.user;
        this.replied = replied;
        this.client = client;
        this.util = {
            send: this.send,
            reply: this.send,
            parsed: { slash }
        };
        this.id = interaction.id;
    }
    async send(...options) {
        if (options[0].embed) {
            options[0].embeds = [options[0].embed];
            delete options[0].embed;
            delete options[0].allowedMentions;
        }
        if (this._message) {
            return this._message.edit(...options);
        }
        if (this.replied) {
            await this.interaction.editReply(options[0], options[1]);
            this._message = await this.interaction.fetchReply();
            return this._message;
        }
        this.replied = true;
        this.interaction.reply(...options);
        this._message = await this.interaction.fetchReply();
        return this._message;
    }
    reply(...args) {
        this.send(...args);
    }
}
module.exports = AkairoMessage;
