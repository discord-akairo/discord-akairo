const AkairoError = require('../../../util/AkairoError');
const AkairoHandler = require('../../AkairoHandler');
const Type = require('./Type');

/**
 * Also includes properties from AkairoHandlerOptions.
 * @typedef {AkairoHandlerOptions} TypeHandlerOptions
 * @prop {boolean} [includeBuiltin=true] Whether or not to include builtin types.
 */

/** @extends AkairoHandler */
class TypeHandler extends AkairoHandler {
    /**
     * Loads types.
     * @param {AkairoClient} client - The Akairo client.
     * @param {TypeHandlerOptions} options - Options.
     */
    constructor(client, {
        directory,
        classToHandle = Type,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter,
        includeBuiltin = true
    }) {
        if (!(classToHandle.prototype instanceof Type || classToHandle === Type)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Type.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * Command handler to use.
         * @type {?CommandHandler}
         */
        this.commandHandler = null;

        /**
         * Inhibitor handler to use.
         * @type {?InhibitorHandler}
         */
        this.inhibitorHandler = null;

        /**
         * Listener handler to use.
         * @type {?ListenerHandler}
         */
        this.listenerHandler = null;

        /**
         * Directory to types.
         * @name TypeHandler#directory
         * @type {string}
         */

        /**
         * Types loaded, mapped by ID to Type.
         * @name TypeHandler#modules
         * @type {Collection<string, Type>}
         */

        if (includeBuiltin) {
            const types = require('./BuiltinTypes');
            for (const BuiltinType of types) {
                this.load(BuiltinType);
            }
        }
    }

    /**
     * Sets the command handler to use.
     * Used in the `commandAlias` and `command` types.
     * @param {CommandHandler} commandHandler - The command handler.
     * @returns {TypeHandler}
     */
    useCommandHandler(commandHandler) {
        this.commandHandler = commandHandler;
        return this;
    }

    /**
     * Sets the inhibitor handler to use.
     * Used in the `inhibitor` type.
     * @param {InhibitorHandler} inhibitorHandler - The inhibitor handler.
     * @returns {TypeHandler}
     */
    useInhibitorHandler(inhibitorHandler) {
        this.inhibitorHandler = inhibitorHandler;
        return this;
    }

    /**
     * Sets the listener handler to use.
     * Used in the `listener` type.
     * @param {ListenerHandler} listenerHandler - The listener handler.
     * @returns {TypeHandler}
     */
    useListenerHandler(listenerHandler) {
        this.listenerHandler = listenerHandler;
        return this;
    }
}

module.exports = TypeHandler;
