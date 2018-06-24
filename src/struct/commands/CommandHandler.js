const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const { BuiltInReasons, CommandHandlerEvents, Symbols } = require('../../util/Constants');
const { Collection } = require('discord.js');
const Command = require('./Command');
const CommandUtil = require('./CommandUtil');
const { isPromise } = require('../../util/Util');
const TypeResolver = require('./arguments/TypeResolver');

/**
 * Also includes properties from AkairoHandlerOptions.
 * @typedef {AkairoHandlerOptions} CommandHandlerOptions
 * @prop {boolean} [blockOthers=true] - Whether or not to block others, if a selfbot.
 * @prop {boolean} [blockClient=true] - Whether or not to block self, if not a selfbot.
 * @prop {boolean} [blockBots=true] - Whether or not to block bots.
 * @prop {string|string[]|PrefixFunction} [prefix='!'] - Default command prefix(es).
 * @prop {boolean|AllowMentionFunction} [allowMention=true] - Whether or not to allow mentions to the client user as a prefix.
 * @prop {RegExp} [aliasReplacement] - Regular expression to automatically make command aliases.
 * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
 * So, the alias `command-name` is valid as both `command-name` and `commandname`.
 * @prop {boolean} [handleEdits=false] - Whether or not to handle edited messages.
 * @prop {boolean} [commandUtil=false] - Whether or not to assign `message.util`.
 * Set to `true` by default if `handleEdits` is on.
 * @prop {boolean} [storeMessages=false] - Whether or not to have CommandUtil store all prompts and their replies.
 * @prop {number} [commandUtilLifetime=0] - Milliseconds a command util should last before it is removed.
 * If 0, CommandUtil instances will never be removed.
 * @prop {boolean} [fetchMembers=false] - Whether or not to fetch member on each message from a guild.
 * @prop {number} [defaultCooldown=0] - The default cooldown for commands.
 * @prop {Snowflake|Snowflake[]} [ignoreCooldownID] - ID of user(s) to ignore cooldown.
 * Defaults to the client owner(s) option.
 * @prop {ArgumentPromptOptions} [defaultPrompt] - The default prompt options.
 */

/**
 * A function that returns the prefix(es) to use.
 * @typedef {Function} PrefixFunction
 * @param {Message} message - Message to get prefix for.
 * @returns {string|string[]}
 */

/**
 * A function that returns whether mentions can be used as a prefix.
 * @typedef {Function} AllowMentionFunction
 * @param {Message} message - Message to option for.
 * @returns {boolean}
 */

/** @extends AkairoHandler */
class CommandHandler extends AkairoHandler {
    /**
     * Loads commands and handles messages.
     * @param {AkairoClient} client - The Akairo client.
     * @param {CommandHandlerOptions} options - Options.
     */
    constructor(client, {
        directory,
        classToHandle = Command,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter,
        blockOthers = true,
        blockClient = true,
        blockBots = true,
        fetchMembers = false,
        handleEdits = false,
        commandUtil,
        commandUtilLifetime = 0,
        storeMessages = false,
        defaultCooldown = 0,
        ignoreCooldownID,
        defaultPrompt = {},
        prefix = '!',
        allowMention = false,
        aliasReplacement
    } = {}) {
        if (!(classToHandle.prototype instanceof Command || classToHandle === Command)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Command.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * The type resolver.
         * @type {TypeResolver}
         */
        this.resolver = new TypeResolver(this);

        /**
         * Collecion of command aliases.
         * @type {Collection<string, string>}
         */
        this.aliases = new Collection();

        /**
         * Regular expression to automatically make command aliases for.
         * @type {?RegExp}
         */
        this.aliasReplacement = aliasReplacement;

        /**
         * Collection of prefix overwrites to commands.
         * @type {Collection<string|PrefixFunction, Set<string>>}
         */
        this.prefixes = new Collection();

        /**
         * Whether or not to block others, if a selfbot.
         * @type {boolean}
         */
        this.blockOthers = Boolean(blockOthers);

        /**
         * Whether or not to block self, if not a selfbot.
         * @type {boolean}
         */
        this.blockClient = Boolean(blockClient);

        /**
         * Whether or not to block bots.
         * @type {boolean}
         */
        this.blockBots = Boolean(blockBots);

        /**
         * Whether or not members are fetched on each message author from a guild.
         * @type {boolean}
         */
        this.fetchMembers = Boolean(fetchMembers);

        /**
         * Whether or not edits are handled.
         * @type {boolean}
         */
        this.handleEdits = Boolean(handleEdits);

        /**
         * Whether or not `message.util` is assigned.
         * @type {boolean}
         */
        this.commandUtil = commandUtil !== undefined ? Boolean(commandUtil) : this.handleEdits;

        /**
         * How long a command util will last in milliseconds before it is removed.
         * @type {number}
         */
        this.commandUtilLifetime = commandUtilLifetime;

        /**
         * Whether or not to store messages in CommandUtil.
         * @type {boolean}
         */
        this.storeMessages = Boolean(storeMessages);

        /**
         * Collection of CommandUtils.
         * @type {Collection<string, CommandUtil>}
         */
        this.commandUtils = new Collection();

        /**
         * Collection of cooldowns.
         * @type {Collection<string, Object>}
         */
        this.cooldowns = new Collection();

        /**
         * Default cooldown for commands.
         * @type {number}
         */
        this.defaultCooldown = defaultCooldown;

        /**
         * ID of user(s) to ignore cooldown.
         * @type {Snowflake|Snowflake[]}
         */
        this.ignoreCooldownID = ignoreCooldownID === undefined ? this.client.ownerID : ignoreCooldownID;

        /**
         * Collection of sets of ongoing argument prompts.
         * @type {Collection<string, Set<string>>}
         */
        this.prompts = new Collection();

        /**
         * Default prompt options.
         * @type {ArgumentPromptOptions}
         */
        this.defaultPrompt = Object.assign({
            start: '',
            retry: '',
            timeout: '',
            ended: '',
            cancel: '',
            retries: 1,
            time: 30000,
            cancelWord: 'cancel',
            stopWord: 'stop',
            optional: false,
            infinite: false,
            limit: Infinity
        }, defaultPrompt);

        /**
         * The prefix(es) for command parsing.
         * @type {string|string[]|PrefixFunction}
         */
        this.prefix = typeof prefix === 'function' ? prefix.bind(this) : prefix;

        /**
         * Whether or not mentions are allowed for prefixing.
         * @type {boolean|AllowMentionFunction}
         */
        this.allowMention = typeof allowMention === 'function' ? allowMention.bind(this) : Boolean(allowMention);

        /**
         * Inhibitor handler to use.
         * @type {?InhibitorHandler}
         */
        this.inhibitorHandler = null;

        /**
         * Directory to commands.
         * @name CommandHandler#directory
         * @type {string}
         */

        /**
         * Commands loaded, mapped by ID to Command.
         * @name CommandHandler#modules
         * @type {Collection<string, Command>}
         */

        this.setup();
    }

    setup() {
        this.client.once('ready', () => {
            this.client.on('message', m => {
                this.handle(m);
            });

            if (this.handleEdits) {
                this.on('messageUpdate', (o, m) => {
                    if (o.content === m.content) return;
                    if (this.handleEdits) this.handle(m);
                });
            }
        });
    }

    /**
     * Registers a module.
     * @param {Command} command - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(command, filepath) {
        super.register(command, filepath);

        for (let alias of command.aliases) {
            const conflict = this.aliases.get(alias.toLowerCase());
            if (conflict) throw new AkairoError('ALIAS_CONFLICT', alias, command.id, conflict);

            alias = alias.toLowerCase();
            this.aliases.set(alias, command.id);
            if (this.aliasReplacement) {
                const replacement = alias.replace(this.aliasReplacement, '');

                if (replacement !== alias) {
                    const replacementConflict = this.aliases.get(replacement);
                    if (replacementConflict) throw new AkairoError('ALIAS_CONFLICT', replacement, command.id, replacementConflict);
                    this.aliases.set(replacement, command.id);
                }
            }
        }

        if (command.prefix != null) {
            let newEntry = false;

            if (Array.isArray(command.prefix)) {
                for (const prefix of command.prefix) {
                    const prefixes = this.prefixes.get(prefix);
                    if (prefixes) {
                        prefixes.add(command.id);
                    } else {
                        this.prefixes.set(prefix, new Set([command.id]));
                        newEntry = true;
                    }
                }
            } else {
                const prefixes = this.prefixes.get(command.prefix);
                if (prefixes) {
                    prefixes.add(command.id);
                } else {
                    this.prefixes.set(command.prefix, new Set([command.id]));
                    newEntry = true;
                }
            }

            if (newEntry) {
                this.prefixes = this.prefixes.sort((aVal, bVal, aKey, bKey) => {
                    if (aKey === '' && bKey === '') return 0;
                    if (aKey === '') return 1;
                    if (bKey === '') return -1;
                    if (typeof aKey === 'function' && typeof bKey === 'function') return 0;
                    if (typeof aKey === 'function') return 1;
                    if (typeof bKey === 'function') return -1;
                    return aKey.length === bKey.length
                        ? aKey.localeCompare(bKey)
                        : bKey.length - aKey.length;
                });
            }
        }
    }

    /**
     * Deregisters a module.
     * @param {Command} command - Module to use.
     * @returns {void}
     */
    deregister(command) {
        for (let alias of command.aliases) {
            alias = alias.toLowerCase();
            this.aliases.delete(alias);

            if (this.aliasReplacement) {
                const replacement = alias.replace(this.aliasReplacement, '');
                if (replacement !== alias) this.aliases.delete(replacement);
            }
        }

        if (command.prefix != null) {
            if (Array.isArray(command.prefix)) {
                for (const prefix of command.prefix) {
                    const prefixes = this.prefixes.get(prefix);
                    if (prefixes.size === 1) {
                        this.prefixes.delete(prefix);
                    } else {
                        prefixes.delete(prefix);
                    }
                }
            } else {
                const prefixes = this.prefixes.get(command.prefix);
                if (prefixes.size === 1) {
                    this.prefixes.delete(command.prefix);
                } else {
                    prefixes.delete(command.prefix);
                }
            }
        }

        super.deregister(command);
    }

    /**
     * Handles a message.
     * @param {Message} message - Message to handle.
     * @returns {Promise<void>}
     */
    async handle(message) {
        try {
            if (this.fetchMembers && message.guild && !message.member && !message.webhookID) {
                await message.guild.members.fetch(message.author);
            }

            if (await this.runAllTypeInhibitors(message)) {
                return;
            }

            if (this.commandUtil) {
                if (this.commandUtils.has(message.id)) {
                    message.util = this.commandUtils.get(message.id);
                } else {
                    message.util = new CommandUtil(this.client, message);
                    this.commandUtils.set(message.id, message.util);

                    if (this.commandUtilLifetime) {
                        this.client.setTimeout(() => this.commandUtils.delete(message.id), this.commandUtilLifetime);
                    }
                }
            }

            if (await this.runPreTypeInhibitors(message)) {
                return;
            }

            const parsed = await this.parseCommand(message) || {};
            const { command, content, prefix, alias } = parsed;

            if (this.commandUtil) {
                Object.assign(message.util, {
                    command,
                    prefix,
                    alias,
                    content
                });
            }

            if (!parsed.command) {
                this.handleRegexAndConditionalCommands(message);
                return;
            }

            this.handleDirectCommand(message, content, command);
        } catch (err) {
            this.emitError(err, message);
        }
    }

    /**
     * Handles normal commands.
     * @param {Message} message - Message to handle.
     * @param {string} content - Content of message without command.
     * @param {Command} command - Command instance.
     * @returns {Promise<void>}
     */
    async handleDirectCommand(message, content, command) {
        try {
            if (message.edited && !command.editable) return;
            if (await this.runPostTypeInhibitors(message, command)) return;
            const args = await command.parse(content, message);
            if (args === Symbols.COMMAND_CANCELLED) {
                this.emit(CommandHandlerEvents.COMMAND_CANCELLED, message, command);
                return;
            }

            await this.runCommand(message, command, args);
        } catch (err) {
            this.emitError(err, message, command);
        }
    }

    /**
     * Handles regex and conditional commands.
     * @param {Message} message - Message to handle.
     * @returns {Promise<void>}
     */
    async handleRegexAndConditionalCommands(message) {
        await this.handleRegexCommands(message);
        await this.handleConditionalCommands(message);
    }

    /**
     * Handles regex commands.
     * @param {Message} message - Message to handle.
     * @returns {Promise<void>}
     */
    async handleRegexCommands(message) {
        const matchedCommands = [];

        for (const command of this.modules.values()) {
            if (message.edited ? command.editable : true) {
                const regex = typeof command.trigger === 'function' ? command.trigger(message) : command.trigger;
                if (regex) matchedCommands.push({ command, regex });
            }
        }

        const triggered = [];

        for (const entry of matchedCommands) {
            const match = message.content.match(entry.regex);
            if (!match) continue;

            const matches = [];

            if (entry.regex.global) {
                let matched;

                while ((matched = entry.regex.exec(message.content)) != null) {
                    matches.push(matched);
                }
            }

            triggered.push({ command: entry.command, match, matches });
        }

        const promises = [];

        for (const { command, match, matches } of triggered) {
            promises.push((async () => {
                try {
                    if (await this.runPostTypeInhibitors(message, command)) return;
                    await this.runCommand(message, command, { match, matches });
                } catch (err) {
                    this.emitError(err, message, command);
                }
            })());
        }

        await Promise.all(promises);
    }

    /**
     * Handles conditional commands.
     * @param {Message} message - Message to handle.
     * @returns {Promise<void>}
     */
    async handleConditionalCommands(message) {
        const trueCommands = this.modules.filter(command =>
            (message.edited ? command.editable : true)
            && command.condition(message)
        );

        if (!trueCommands.size) {
            this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
            return;
        }

        const promises = [];

        for (const command of trueCommands.values()) {
            promises.push((async () => {
                try {
                    if (await this.runPostTypeInhibitors(message, command)) return;
                    await this.runCommand(message, command, {});
                } catch (err) {
                    this.emitError(err, message, command);
                }
            })());
        }

        await Promise.all(promises);
    }

    /**
     * Runs inhibitors with the all type.
     * @param {Message} message - Message to handle.
     * @returns {Promise<boolean>}
     */
    async runAllTypeInhibitors(message) {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('all', message)
            : null;

        if (reason != null) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        } else if (this.blockOthers && message.author.id !== this.client.user.id && this.client.selfbot) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.OTHERS);
        } else if (this.blockClient && message.author.id === this.client.user.id && !this.client.selfbot) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
        } else if (this.blockBots && message.author.bot) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
        } else {
            return false;
        }

        return true;
    }

    /**
     * Runs inhibitors with the pre type.
     * @param {Message} message - Message to handle.
     * @returns {Promise<boolean>}
     */
    async runPreTypeInhibitors(message) {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('pre', message)
            : null;

        if (reason != null) {
            this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        } else if (this.hasPrompt(message.channel, message.author)) {
            this.emit(CommandHandlerEvents.IN_PROMPT, message);
        } else {
            return false;
        }

        return true;
    }

    /**
     * Runs inhibitors with the post type.
     * @param {Message} message - Message to handle.
     * @param {Command} command - Command to handle.
     * @returns {Promise<boolean>}
     */
    async runPostTypeInhibitors(message, command) {
        if (command.ownerOnly) {
            const notOwner = Array.isArray(this.client.ownerID)
                ? !this.client.ownerID.includes(message.author.id)
                : message.author.id !== this.client.ownerID;

            if (notOwner) {
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.OWNER);
                return true;
            }
        }

        if (command.channel === 'guild' && !message.guild) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.GUILD);
            return true;
        }

        if (command.channel === 'dm' && message.guild) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BuiltInReasons.DM);
            return true;
        }

        if (command.clientPermissions) {
            if (typeof command.clientPermissions === 'function') {
                let missing = command.clientPermissions(message);
                if (isPromise(missing)) missing = await missing;

                if (missing != null) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'client', missing);
                    return true;
                }
            } else if (message.guild) {
                const missing = message.channel.permissionsFor(this.client.user).missing(command.clientPermissions);
                if (missing.length) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'client', missing);
                    return true;
                }
            }
        }

        if (command.userPermissions) {
            if (typeof command.userPermissions === 'function') {
                let missing = command.userPermissions(message);
                if (isPromise(missing)) missing = await missing;

                if (missing != null) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'user', missing);
                    return true;
                }
            } else if (message.guild) {
                const missing = message.channel.permissionsFor(message.author).missing(command.userPermissions);
                if (missing.length) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, command, 'user', missing);
                    return true;
                }
            }
        }

        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('post', message, command)
            : null;

        if (reason != null) {
            if (command.typing) message.channel.stopTyping();
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
            return true;
        }

        if (this.runCooldowns(message, command)) {
            return true;
        }

        return false;
    }

    /**
     * Runs cooldowns and checks if a user is under cooldown.
     * @param {Message} message - Message that called the command.
     * @param {Command} command - Command to cooldown.
     * @returns {boolean}
     */
    runCooldowns(message, command) {
        const isIgnored = Array.isArray(this.ignoreCooldownID)
            ? this.ignoreCooldownID.includes(message.author.id)
            : message.author.id === this.ignoreCooldownID;

        if (isIgnored) return false;

        const time = command.cooldown != null ? command.cooldown : this.defaultCooldown;
        if (!time) return false;

        const endTime = message.createdTimestamp + time;

        const id = message.author.id;
        if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

        if (!this.cooldowns.get(id)[command.id]) {
            this.cooldowns.get(id)[command.id] = {
                timer: this.client.setTimeout(() => {
                    this.client.clearTimeout(this.cooldowns.get(id)[command.id].timer);
                    this.cooldowns.get(id)[command.id] = null;

                    if (!Object.keys(this.cooldowns.get(id)).length) {
                        this.cooldowns.delete(id);
                    }
                }, time),
                end: endTime,
                uses: 0
            };
        }

        const entry = this.cooldowns.get(id)[command.id];

        if (entry.uses >= command.ratelimit) {
            const end = this.cooldowns.get(message.author.id)[command.id].end;
            const diff = end - message.createdTimestamp;

            this.emit(CommandHandlerEvents.COOLDOWN, message, command, diff);
            return true;
        }

        entry.uses++;
        return false;
    }

    /**
     * Runs a command.
     * @param {Message} message - Message to handle.
     * @param {Command} command - Command to handle.
     * @param {Object} args - Arguments to use.
     * @returns {Promise<void>}
     */
    async runCommand(message, command, args) {
        if (command.typing) {
            message.channel.startTyping();
        }

        this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, args);
        const ret = await command.exec(message, args);
        this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command, args, ret);
        if (command.typing) {
            message.channel.stopTyping();
        }
    }

    /**
     * Parses the command and its argument list.
     * @param {Message} message - Message that called the command.
     * @returns {Promise<Object>}
     */
    async parseCommand(message) {
        let prefix;
        if (typeof this.prefix === 'function') {
            prefix = this.prefix(message);
            if (isPromise(prefix)) {
                prefix = await prefix;
            }
        } else {
            prefix = this.prefix;
        }

        if (typeof this.allowMention === 'function' ? this.allowMention(message) : this.allowMention) {
            prefix = Array.isArray(prefix)
                ? [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`, ...prefix]
                : [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`, prefix];
        }

        let start;

        if (Array.isArray(prefix)) {
            prefix.sort((a, b) => {
                if (a === '' && b === '') return 0;
                if (a === '') return 1;
                if (a === '') return -1;
                return a.length === b.length
                    ? a.localeCompare(b)
                    : b.length - a.length;
            });

            const content = message.content.toLowerCase();
            const match = prefix.find(p => {
                return content.startsWith(p.toLowerCase());
            });

            start = match;
        } else if (message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
            start = prefix;
        }

        if (start === undefined) return this.parseCommandWithOverwrittenPrefixes(message);

        const startIndex = message.content.indexOf(start) + start.length;
        const argsIndex = message.content.slice(startIndex).search(/\S/) + start.length;
        const name = message.content.slice(argsIndex).split(/\s{1,}|\n{1,}/)[0];
        const command = this.findCommand(name);

        if (!command) return this.parseCommandWithOverwrittenPrefixes(message) || { prefix: start, alias: name };
        if (command.prefix != null) return this.parseCommandWithOverwrittenPrefixes(message);

        const content = message.content.slice(argsIndex + name.length + 1);
        return { command, content, prefix: start, alias: name };
    }

    /**
     * Parses the command and its argument list using prefix overwrites.
     * @param {Message} message - Message that called the command.
     * @returns {Promise<Object>}
     */
    async parseCommandWithOverwrittenPrefixes(message) {
        if (!this.prefixes.size) return null;

        let start;
        let commands;

        for (const entry of this.prefixes) {
            let prefix;
            if (typeof entry[0] === 'function') {
                prefix = entry[0](message);
                if (isPromise(prefix)) {
                    // eslint-disable-next-line no-await-in-loop
                    prefix = await prefix;
                }
            } else {
                prefix = entry[0];
            }

            if (Array.isArray(prefix)) {
                prefix.sort((a, b) => {
                    if (a === '' && b === '') return 0;
                    if (a === '') return 1;
                    if (a === '') return -1;
                    return a.length === b.length
                        ? a.localeCompare(b)
                        : b.length - a.length;
                });
            }

            if (Array.isArray(prefix)) {
                const content = message.content.toLowerCase();
                const match = prefix.find(p => {
                    return content.startsWith(p.toLowerCase());
                });

                if (match !== undefined) {
                    start = match;
                    commands = entry[1];
                    break;
                }
            } else if (message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
                start = prefix;
                commands = entry[1];
                break;
            }
        }

        if (start === undefined) return null;

        const startIndex = message.content.indexOf(start) + start.length;
        const argsIndex = message.content.slice(startIndex).search(/\S/) + start.length;
        const name = message.content.slice(argsIndex).split(/\s{1,}|\n{1,}/)[0];
        const command = this.findCommand(name);

        if (!command || !commands.has(command.id)) return { prefix: start, alias: name };

        const content = message.content.slice(argsIndex + name.length + 1);
        return { command, content, prefix: start, alias: name };
    }

    /**
     * Handles errors from the handling.
     * @param {Error} err - The error.
     * @param {Message} message - Message that called the command.
     * @param {Command} [command] - Command that errored.
     * @returns {void}
     */
    emitError(err, message, command) {
        if (command && command.typing) message.channel.stopTyping();
        if (this.listenerCount(CommandHandlerEvents.ERROR)) {
            this.emit(CommandHandlerEvents.ERROR, err, message, command);
            return;
        }

        throw err;
    }

    /**
     * Adds an ongoing prompt in order to prevent command usage in the channel.
     * @param {Channel} channel - Channel to add to.
     * @param {User} user - User to add.
     * @returns {void}
     */
    addPrompt(channel, user) {
        let users = this.prompts.get(channel.id);
        if (!users) this.prompts.set(channel.id, new Set());
        users = this.prompts.get(channel.id);
        users.add(user.id);
    }

    /**
     * Removes an ongoing prompt.
     * @param {Channel} channel - Channel to remove from.
     * @param {User} user - User to remove.
     * @returns {void}
     */
    removePrompt(channel, user) {
        const users = this.prompts.get(channel.id);
        if (!users) return;
        users.delete(user.id);
        if (!users.size) this.prompts.delete(user.id);
    }

    /**
     * Checks if there is an ongoing prompt.
     * @param {Channel} channel - Channel to check.
     * @param {User} user - User to check.
     * @returns {boolean}
     */
    hasPrompt(channel, user) {
        const users = this.prompts.get(channel.id);
        if (!users) return false;
        return users.has(user.id);
    }

    /**
     * Finds a command by alias.
     * @param {string} name - Alias to find with.
     * @returns {Command}
     */
    findCommand(name) {
        return this.modules.get(this.aliases.get(name.toLowerCase()));
    }

    /**
     * Set the inhibitor handler to use.
     * @param {InhibitorHandler} inhibitorHandler - The inhibitor handler.
     * @returns {void}
     */
    useInhibitorHandler(inhibitorHandler) {
        this.inhibitorHandler = inhibitorHandler;
        this.resolver.inhibitorHandler = inhibitorHandler;
    }

    /**
     * Set the listener handler to use.
     * @param {ListenerHandler} listenerHandler - The listener handler.
     * @returns {void}
     */
    useListenerHandler(listenerHandler) {
        this.resolver.listenerHandler = listenerHandler;
    }

    /**
     * Loads a command.
     * @method
     * @name CommandHandler#load
     * @param {string|Command} thing - Module or path to module.
     * @returns {Command}
     */

    /**
     * Reads all commands from the directory and loads them.
     * @method
     * @name CommandHandler#loadAll
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param {LoadFilterFunction} [filter] - Filter for files, where true means it should be loaded.
     * @returns {CommandHandler}
     */

    /**
     * Removes a command.
     * @method
     * @name CommandHandler#remove
     * @param {string} id - ID of the command.
     * @returns {Command}
     */

    /**
     * Removes all commands.
     * @method
     * @name CommandHandler#removeAll
     * @returns {CommandHandler}
     */

    /**
     * Reloads a command.
     * @method
     * @name CommandHandler#reload
     * @param {string} id - ID of the command.
     * @returns {Command}
     */

    /**
     * Reloads all commands.
     * @method
     * @name CommandHandler#reloadAll
     * @returns {CommandHandler}
     */
}

module.exports = CommandHandler;

/**
 * Emitted when a message is blocked by a pre-message inhibitor.
 * The built-in inhibitors are 'others' (for selfbots), 'client', and 'bot'.
 * @event CommandHandler#messageBlocked
 * @param {Message} message - Message sent.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a message does not start with the prefix or match a command.
 * @event CommandHandler#messageInvalid
 * @param {Message} message - Message sent.
 */

/**
 * Emitted when a command is found disabled.
 * @event CommandHandler#commandDisabled
 * @param {Message} message - Message sent.
 * @param {Command} command - Command found.
 */

/**
 * Emitted when a command is blocked by a post-message inhibitor.
 * The built-in inhibitors are 'owner', 'guild', and 'dm'.
 * @event CommandHandler#commandBlocked
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a command starts execution.
 * @event CommandHandler#commandStarted
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {Object} args - The args passed to the command.
 */

/**
 * Emitted when a command finishes execution.
 * @event CommandHandler#commandFinished
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {Object} args - The args passed to the command.
 * @param {any} returnValue - The command's return value.
 */

/**
 * Emitted when a command is cancelled via prompt or argument cancel.
 * @event CommandHandler#commandCancelled
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 */

/**
 * Emitted when a command is found on cooldown.
 * @event CommandHandler#cooldown
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {number} remaining - Remaining time in milliseconds for cooldown.
 */

/**
 * Emitted when a user is in a command argument prompt.
 * Used to prevent usage of commands during a prompt.
 * @event CommandHandler#inPrompt
 * @param {Message} message - Message sent.
 */

/**
 * Emitted when a permissions check is failed.
 * @event CommandHandler#missingPermissions
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} type - Either 'client' or 'user'.
 * @param {any} missing - The missing permissions.
 */

/**
 * Emitted when a command or inhibitor errors.
 * @event CommandHandler#error
 * @param {Error} error - The error.
 * @param {Message} message - Message sent.
 * @param {?Command} command - Command executed.
 */

/**
 * Emitted when a command is loaded.
 * @event CommandHandler#load
 * @param {Command} command - Module loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a command is removed.
 * @event CommandHandler#remove
 * @param {Command} command - Command removed.
 */
