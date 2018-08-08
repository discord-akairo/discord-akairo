const AkairoError = require('../../../util/AkairoError');
const AkairoModule = require('../../AkairoModule');

/** @extends AkairoModule */
class Type extends AkairoModule {
    /**
     * Creates a new Type.
     * @param {string} id - Type ID.
     * @param {ModuleOptions} [options={}] - Options for the type.
     */
    constructor(id, { category } = {}) {
        super(id, { category });

        /**
         * The ID of this type.
         * @name Type#id
         * @type {string}
         */

        /**
         * The type handler.
         * @name Type#handler
         * @type {TypeHandler}
         */
    }

    /**
     * Casts some string input to a value of this type.
     * A null or undefined value means that the cast has failed.
     * @abstract
     * @param {string} phrase - Phrase to process.
     * @param {Message} message - Message that called the command.
     * @param {Object} args - Previous arguments from command.
     * @returns {any|Promise<any>}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    static create(id, fn) {
        return class extends Type {
            constructor() {
                super(id);
            }

            exec(phrase, message, args) {
                return fn.call(this, phrase, message, args);
            }
        };
    }
}

module.exports = Type;
