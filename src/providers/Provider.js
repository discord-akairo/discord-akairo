const { Collection } = require('discord.js');

class Provider {
    constructor() {
        this.items = new Collection();
    }

    init() {
        throw new TypeError(`${this.constructor.name}#init has not been implemented`);
    }

    get() {
        throw new TypeError(`${this.constructor.name}#get has not been implemented`);
    }

    set() {
        throw new TypeError(`${this.constructor.name}#set has not been implemented`);
    }

    delete() {
        throw new TypeError(`${this.constructor.name}#delete has not been implemented`);
    }

    clear() {
        throw new TypeError(`${this.constructor.name}#clear has not been implemented`);
    }
}

module.exports = Provider;
