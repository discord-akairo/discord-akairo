const AkairoError = require('../../../util/AkairoError');
const AkairoModule = require('../../AkairoModule');
const Argument = require('../arguments/Argument');

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

    /**
     * Creates a type class from a type function.
     * @param {string} id - ID of the type.
     * @param {ArgumentTypeFunction} fn - The argument function.
     * @returns {Function}
     */
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

    /**
     * Creates a type function from multiple types (union type).
     * The first type that resolves to a non-void value is used.
     * @param {...ArgumentType|ArgumentTypeFunction} types - Types to use.
     * @returns {ArgumentTypeFunction}
     */
    /* eslint-disable no-invalid-this */
    static union(...types) {
        return async function typeFn(phrase, message, args) {
            for (let entry of types) {
                if (typeof entry === 'function') entry = entry.bind(this);
                // eslint-disable-next-line no-await-in-loop
                const res = await Argument.cast(entry, this.handler.typeHandler, phrase, message, args);
                if (res != null) return res;
            }

            return null;
        };
    }

    /**
     * Creates a type function from multiple types (tuple type).
     * Only inputs where each type resolves with a non-void value are valid.
     * @param {...ArgumentType|ArgumentTypeFunction} types - Types to use.
     * @returns {ArgumentTypeFunction}
     */
    static tuple(...types) {
        return async function typeFn(phrase, message, args) {
            const results = [];
            for (const entry of types) {
                // eslint-disable-next-line no-await-in-loop
                const res = await Argument.cast(entry, this.handler.typeHandler, phrase, message, args);
                if (res == null) return null;
                results.push(res);
            }

            return results;
        };
    }

    /**
     * Creates a type function with extra validation.
     * If the predicate is not true, the value is considered invalid.
     * @param {ArgumentType|ArgumentTypeFunction} type - The type to use.
     * @param {ArgumentPredicate} predicate - The predicate function.
     * @returns {ArgumentTypeFunction}
     */
    static validate(type, predicate) {
        return async function typeFn(phrase, message, args) {
            const res = await Argument.cast(type, this.handler.typeHandler, phrase, message, args);
            if (res == null) return null;
            if (!predicate(res, phrase, message, args)) return null;
            return res;
        };
    }
    /* eslint-enable no-invalid-this */

    /**
     * Creates a type function where the parsed value must be within a range.
     * @param {ArgumentType|ArgumentTypeFunction} type - The type to use
     * @param {number} min - Minimum value.
     * @param {number} max - Maximum value.
     * @param {boolean} [inclusive=false] - Whether or not to be inclusive on the upper bound.
     * @returns {ArgumentTypeFunction}
     */
    static range(type, min, max, inclusive = false) {
        return Type.validate(type, x => x >= min && (inclusive ? x <= max : x < max));
    }
}

module.exports = Type;
