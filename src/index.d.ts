declare module 'sqlite' {
    export interface Database {}
    export interface Statement {}
}

declare module 'sequelize' {
    export interface Model<K, V> {}
    export interface Promise<T> {}
}

declare module 'discord-akairo' {
    import {
        BufferResolvable, Client, ClientOptions, Collection, Message, MessageAttachment, MessageEmbed, MessageOptions, MessageEditOptions,
        User, GuildMember, Channel, Role, Emoji, Guild, PermissionResolvable, Snowflake
    } from 'discord.js';

    import { Database, Statement } from 'sqlite';
    import { Model, Promise as Bluebird } from 'sequelize';

    import * as EventEmitter from 'events';
    import { Stream } from 'stream';

    module 'discord.js' {
        export interface Message {
            util?: CommandUtil;
        }
    }

    export class AkairoError extends Error {
        public code: string;
    }

    export class AkairoClient extends Client {
        public constructor(options?: AkairoOptions & ClientOptions, clientOptions?: ClientOptions);

        public ownerID: Snowflake | Snowflake[];
        public selfbot: boolean;
        public util: ClientUtil;
    }

    export class AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public automateCategories: boolean;
        public extensions: Set<string>;
        public categories: Collection<string, Category<string, AkairoModule>>;
        public classToHandle: Function;
        public client: AkairoClient;
        public directory: string;
        public loadFiler: LoadFilterFunction;
        public modules: Collection<string, AkairoModule>;

        public deregister(mod: AkairoModule): void;
        public findCategory(name: string): Category<string, AkairoModule>;
        public load(thing: string | Function, isReload?: boolean): AkairoModule;
        public loadAll(directory?: string, filter?: LoadFilterFunction): this;
        public register(mod: AkairoModule, filepath?: string): void;
        public reload(id: string): AkairoModule;
        public reloadAll(): this;
        public remove(id: string): AkairoModule;
        public removeAll(): this;
        public on(event: 'remove', listener: (mod: AkairoModule) => any): this;
        public on(event: 'load', listener: (mod: AkairoModule, isReload: boolean) => any): this;

        public static readdirRecursive(directory: string): string[];
    }

    export class AkairoModule {
        public constructor(id: string, options?: AkairoModuleOptions);

        public category: Category<string, AkairoModule>;
        public categoryID: string;
        public client: AkairoClient;
        public enabled: boolean;
        public filepath: string;
        public handler: AkairoHandler;
        public id: string;

        public reload(): this;
        public remove(): this;
    }

    export class Argument {
        public constructor(command: Command, options: ArgumentOptions);

        public readonly client: AkairoClient;
        public command: Command;
        public default: any | ArgumentDefaultFunction;
        public description: string;
        public readonly handler: CommandHandler;
        public id: string;
        public index?: number;
        public limit: number;
        public match: ArgumentMatch;
        public flag?: string | string[];
        public prompt?: ArgumentPromptOptions;
        public type: ArgumentType | ArgumentTypeFunction;
        public unordered: boolean | number | number[];

        public allow(message: Message, args: any): boolean;
        public cast(phrase: string, message: Message, args?: any): Promise<any>;
        public collect(message: Message, args?: any, commandInput?: string): Promise<any>;
        public process(phrase: string, message: Message, args?: any): Promise<any>;

        public static cast(type: ArgumentType | ArgumentTypeFunction, resolver: TypeResolver, phrase: string, message: Message, args?: any): Promise<any>;
        public static every(...types: (ArgumentType | ArgumentTypeFunction)[]): ArgumentTypeFunction;
        public static some(...types: (ArgumentType | ArgumentTypeFunction)[]): ArgumentTypeFunction; 
    }

    export class Category<K, V> extends Collection<K, V> {
        public constructor(id: string, iterable?: Iterable<[K, V][]>);

        public id: string;

        public reloadAll(): this;
        public removeAll(): this;
    }

    export class ClientUtil {
        public constructor(client: AkairoClient);

        public readonly client: AkairoClient;

        public attachment(file: BufferResolvable | Stream, name?: string): MessageAttachment;
        public checkChannel(text: string, channel: Channel, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkEmoji(text: string, emoji: Emoji, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkGuild(text: string, guild: Guild, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkMember(text: string, member: GuildMember, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkRole(text: string, role: Role, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkUser(text: string, user: User, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public collection<K, V>(iterable: Iterable<[K, V][]>): Collection<K, V>;
        public compareStreaming(oldMember: GuildMember, newMember: GuildMember): number;
        public embed(data?: any): MessageEmbed;
        public fetchMember(guild: Guild, id: string, cache?: boolean): Promise<GuildMember>;
        public resolveChannel(text: string, channels: Collection<Snowflake, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Channel;
        public resolveChannels(text: string, channels: Collection<Snowflake, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Channel>;
        public resolveEmoji(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Emoji;
        public resolveEmojis(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Emoji>;
        public resolveGuild(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Guild;
        public resolveGuilds(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Guild>;
        public resolveMember(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): GuildMember;
        public resolveMembers(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, GuildMember>;
        public resolvePermissionNumber(number: number): string[];
        public resolveRole(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Role;
        public resolveRoles(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Role>;
        public resolveUser(text: string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): User;
        public resolveUsers(text: string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, User>;
    }

    export class Command extends AkairoModule {
        public constructor(id: string, options?: CommandOptions & AkairoModuleOptions);

        public aliases: string[];
        public args: (Argument | Control)[] | Argument | Control | ArgumentFunction;
        public quoted: boolean;
        public category: Category<string, Command>;
        public channel?: string;
        public client: AkairoClient;
        public clientPermissions: PermissionResolvable | PermissionResolvable[] | PermissionFunction;
        public cooldown?: number;
        public defaultPrompt: ArgumentPromptOptions;
        public description: string;
        public editable: boolean;
        public filepath: string;
        public handler: CommandHandler;
        public id: string;
        public ownerOnly: boolean;
        public parser: any;
        public prefix?: string | string[] | PrefixFunction;
        public ratelimit: number;
        public regex: RegExp | RegexFunction;
        public typing: boolean;
        public userPermissions: PermissionResolvable | PermissionResolvable[] | PermissionFunction;

        public buildArgs(args: (ArgumentOptions | Control)[] | Argument | Control): (Argument | Control)[];
        public condition(message: Message): boolean;
        public exec(message: Message, args: any): any;
        public getFlags(): any[];
        public parse(content: string, message: Message): Promise<any>;
        public reload(): this;
        public remove(): this;
    }

    export class CommandHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: CommandHandlerOptions & AkairoModuleOptions);

        public aliasReplacement?: RegExp;
        public aliases: Collection<string, string>;
        public allowMention: boolean | AllowMentionFunction;
        public blockBots: boolean;
        public blockClient: boolean;
        public blockOthers: boolean;
        public categories: Collection<string, Category<string, Command>>;
        public classToHandle: typeof Command;
        public client: AkairoClient;
        public commandUtil: boolean;
        public commandUtilLifetime: number;
        public commandUtils: Collection<string, CommandUtil>;
        public cooldowns: Collection<string, any>;
        public defaultCooldown: number;
        public defaultPrompt: ArgumentPromptOptions;
        public directory: string;
        public fetchMembers: boolean;
        public handleEdits: boolean;
        public ignoreCooldownID: Snowflake | Snowflake[];
        public inhibitorHandler?: InhibitorHandler;
        public modules: Collection<string, Command>;
        public prefix: string | string[] | PrefixFunction;
        public prefixes: Collection<string | PrefixFunction, Set<string>>;
        public prompts: Collection<string, Set<string>>;
        public resolver: TypeResolver;
        public storeMessage: boolean;

        public add(filename: string): Command;
        public addPrompt(channel: Channel, user: User): void;
        public deregister(command: Command): void;
        public emitError(err: Error, message: Message, command: Command): void;
        public findCategory(name: string): Category<string, Command>;
        public findCommand(name: string): Command;
        public handle(message: Message): Promise<void>;
        public handleDirectCommand(message: Message, content: string, command: Command): Promise<void>;
        public handleRegexAndConditionalCommands(message: Message): Promise<void>;
        public handleRegexCommands(message: Message): Promise<void>;
        public handleConditionalCommands(message: Message): Promise<void>;
        public hasPrompt(channel: Channel, user: User): boolean;
        public load(thing: string | Function): Command;
        public loadAll(directory?: string, filter?: LoadFilterFunction): this;
        public parseCommand(message: Message): Promise<any>;
        public parseCommandWithOverwrittenPrefixes(message: Message): Promise<any>;
        public register(command: Command, filepath?: string): void;
        public reload(id: string): Command;
        public reloadAll(): this;
        public remove(id: string): Command;
        public removeAll(): this;
        public removePrompt(channel: Channel, user: User): void;
        public runAllTypeInhibitors(message: Message): Promise<boolean>;
        public runPreTypeInhibitors(message: Message): Promise<boolean>;
        public runPostTypeInhibitors(message: Message, command: Command): Promise<boolean>;
        public runCooldowns(message: Message, command: Command): boolean;
        public runCommand(message: Message, command: Command, args: any): Promise<void>;
        public useInhibitorHandler(inhibitorHandler: InhibitorHandler): void;
        public useListenerHandler(ListenerHandler: ListenerHandler): void;
        public on(event: 'remove', listener: (command: Command) => any): this;
        public on(event: 'load', listener: (command: Command, isReload: boolean) => any): this;
        public on(event: 'commandBlocked', listener: (message: Message, command: Command, reason: string) => any): this;
        public on(event: 'commandCancelled', listener: (message: Message, command: Command) => any): this;
        public on(event: 'commandFinished', listener: (message: Message, command: Command, args: any, returnValue: any) => any): this;
        public on(event: 'commandStarted', listener: (message: Message, command: Command, args: any) => any): this;
        public on(event: 'cooldown', listener: (message: Message, command: Command, remaining: number) => any): this;
        public on(event: 'error', listener: (error: Error, message: Message, command: Command) => any): this;
        public on(event: 'inPrompt' | 'messageInvalid', listener: (message: Message) => any): this;
        public on(event: 'messageBlocked', listener: (message: Message, reason: string) => any): this;
        public on(event: 'missingPermissions', listener: (message: Message, command: Command, type: 'client' | 'user', missing?: any) => any): this;
    }

    export class CommandUtil {
        public constructor(handler: CommandHandler, message: Message);

        public alias?: string;
        public handler: CommandHandler;
        public command?: Command;
        public content?: string;
        public lastResponse?: Message;
        public message: Message;
        public messages?: Collection<Snowflake, Message>;
        public prefix?: string;
        public shouldEdit: boolean;

        public addMessage(message: Message | Message[]): Message | Message[];
        public edit(content: string | string[] | MessageEmbed | MessageEditOptions, options?: MessageEmbed | MessageEditOptions): Promise<Message>;
        public reply(content: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | MessageEditOptions, options?: MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | MessageEditOptions): Promise<Message | Message[]>;
        public send(content: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | MessageEditOptions, options?: MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | MessageEditOptions): Promise<Message | Message[]>;
        public sendNew(content: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions, options?: MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions): Promise<Message | Message[]>;
        public setEditable(state: boolean): this;
        public setLastResponse(message: Message | Message[]): Message;

        public static swapOptions(content: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | MessageEditOptions, options?: MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | MessageEditOptions): any[];
    }

    export class Inhibitor extends AkairoModule {
        public constructor(id: string, options?: InhibitorOptions & AkairoModuleOptions);

        public category: Category<string, Inhibitor>;
        public client: AkairoClient;
        public enabled: boolean;
        public filepath: string;
        public handler: InhibitorHandler;
        public id: string;
        public reason: string;
        public type: string;

        public exec(message: Message, command?: Command): boolean | Promise<boolean>;
        public reload(): this;
        public remove(): this;
    }

    export class InhibitorHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public categories: Collection<string, Category<string, Inhibitor>>;
        public classToHandle: typeof Inhibitor;
        public client: AkairoClient;
        public directory: string;
        public modules: Collection<string, Inhibitor>;

        public deregister(inhibitor: Inhibitor): void;
        public findCategory(name: string): Category<string, Inhibitor>;
        public load(thing: string | Function): Inhibitor;
        public loadAll(directory?: string, filter?: LoadFilterFunction): this;
        public register(inhibitor: Inhibitor, filepath?: string): void;
        public reload(id: string): Inhibitor;
        public reloadAll(): this;
        public remove(id: string): Inhibitor;
        public removeAll(): this;
        public test(type: 'all' | 'pre' | 'post', message: Message, command?: Command): Promise<string | void>;
        public on(event: 'remove', listener: (inhibitor: Inhibitor) => any): this;
        public on(event: 'load', listener: (inhibitor: Inhibitor, isReload: boolean) => any): this;
    }

    export class Listener extends AkairoModule {
        public constructor(id: string, options?: ListenerOptions & AkairoModuleOptions);

        public category: Category<string, Listener>;
        public client: AkairoClient;
        public emitter: string | EventEmitter;
        public enabled: boolean;
        public event: string;
        public filepath: string;
        public handler: ListenerHandler;
        public type: string;

        public exec(...args: any[]): any;
        public reload(): this;
        public remove(): this;
    }

    export class ListenerHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public categories: Collection<string, Category<string, Listener>>;
        public classToHandle: typeof Listener;
        public client: AkairoClient;
        public directory: string;
        public emitters: Collection<string, EventEmitter>;
        public modules: Collection<string, Listener>;

        public add(filename: string): Listener;
        public addToEmitter(id: string): Listener;
        public deregister(listener: Listener): void;
        public findCategory(name: string): Category<string, Listener>;
        public load(thing: string | Function): Listener;
        public loadAll(directory?: string, filter?: LoadFilterFunction): this;
        public register(listener: Listener, filepath?: string): void;
        public reload(id: string): Listener;
        public reloadAll(): this;
        public remove(id: string): Listener;
        public removeAll(): this;
        public removeFromEmitter(id: string): Listener;
        public setEmitters(emitters: { [x: string]: EventEmitter }): void;
        public on(event: 'remove', listener: (listener: Listener) => any): this;
        public on(event: 'load', listener: (listener: Listener, isReload: boolean) => any): this;
    }

    export abstract class Provider {
        public items: Collection<string, any>;

        public abstract clear(id: string): any;
        public abstract delete(id: string, key: string): any;
        public abstract get(id: string, key: string, defaultValue: any): any;
        public abstract init(): any;
        public abstract set(id: string, key: string, value: any): any;
    }

    export class SequelizeProvider extends Provider {
        public constructor(table: Model<any, any>, options?: ProviderOptions);

        public dataColumn?: string;
        public idColumn: string;
        public items: Collection<string, any>;
        public table: Model<any, any>;

        public clear(id: string): Bluebird<void>;
        public delete(id: string, key: string): Bluebird<boolean>;
        public get(id: string, key: string, defaultValue: any): any;
        public init(): Bluebird<void>;
        public set(id: string, key: string, value: any): Bluebird<boolean>;
    }

    export class SQLiteProvider extends Provider {
        public constructor(db: Database | Promise<Database>, tableName: string, options?: ProviderOptions);

        public dataColumn?: string;
        public db: Database;
        public idColumn: string;
        public items: Collection<string, any>;
        public tableName: string;

        public clear(id: string): Promise<Statement>;
        public delete(id: string, key: string): Promise<Statement>;
        public get(id: string, key: string, defaultValue: any): any;
        public init(): Promise<void>;
        public set(id: string, key: string, value: any): Promise<Statement>;
    }

    export class TypeResolver {
        public constructor(handler: CommandHandler);

        public client: AkairoClient;
        public commandHandler: CommandHandler;
        public inhibitorHandler?: InhibitorHandler;
        public listenerHandler?: ListenerHandler;
        public types: Collection<string, ArgumentTypeFunction>;

        public addBuiltInTypes(): void;
        public addType(name: string, resolver: ArgumentTypeFunction): this;
        public addTypes(types: { [x: string]: ArgumentTypeFunction }): this;
        public type(name: string): ArgumentTypeFunction;
    }

    export class Util {
        public static isEventEmitter(value: any): boolean;
        public static isPromise(value: any): boolean;
    }

    export type AkairoOptions = {
        selfbot?: boolean;
        ownerID?: Snowflake | Snowflake[];
    };

    export type AkairoHandlerOptions = {
        automateCategories?: boolean;
        classToHandle?: string;
        directory?: string;
        extensions?: string[] | Set<string>;
        loadFilter?: LoadFilterFunction;
    };

    export type AllowMentionFunction = (message: Message) => boolean;

    export type ArgumentDefaultFunction = (message: Message, args: any) => any;

    export type ArgumentFunction = (message: Message, content: string) => any;

    export type ArgumentMatch = 'phrase' | 'rest' | 'separate' | 'flag' | 'option' | 'text' | 'content' | 'none';

    export type ArgumentOptions = {
        default?: ArgumentDefaultFunction | any;
        description?: string | string[];
        id: string;
        index?: number;
        limit?: number;
        match?: ArgumentMatch;
        flag?: string | string[];
        prompt?: ArgumentPromptOptions;
        type?: ArgumentType | ArgumentTypeFunction;
        unordered?: boolean | number | number[];
    };

    export type ArgumentPromptData = {
        infinite: boolean;
        message: Message;
        retries: number;
        phrase: string;
    };

    export type ArgumentPromptFunction = (message: Message, args: any, data: ArgumentPromptData) => string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions;

    export type ArgumentPromptModifyFunction = (text: string, message: Message, args: any, data: ArgumentPromptData) => string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions;

    export type ArgumentPromptOptions = {
        cancel?: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | ArgumentPromptFunction;
        cancelWord?: string;
        ended?: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | ArgumentPromptFunction;
        infinite?: boolean;
        limit?: number;
        modifyCancel?: ArgumentPromptModifyFunction;
        modifyEnded?: ArgumentPromptModifyFunction;
        modifyRetry?: ArgumentPromptModifyFunction;
        modifyStart?: ArgumentPromptModifyFunction;
        modifyTimeout?: ArgumentPromptModifyFunction;
        optional?: boolean;
        retries?: number;
        retry?: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | ArgumentPromptFunction;
        start?: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | ArgumentPromptFunction;
        stopWord?: string;
        time?: number;
        timeout?: string | string[] | MessageEmbed | MessageAttachment | MessageAttachment[] | MessageOptions | ArgumentPromptFunction;
    };

    export type ArgumentType = 'string' | 'lowercase' | 'uppercase' | 'charCodes' | 'number' | 'integer' | 'dynamic' | 'dynamicInt' | 'url' | 'date' | 'color' | 'user' | 'users' | 'member' | 'members' | 'relevant' | 'relevants' | 'channel' | 'channels' | 'textChannel' | 'textChannels' | 'voiceChannel' | 'voiceChannels' | 'role' | 'roles' | 'emoji' | 'emojis' | 'guild' | 'guilds' | 'message' | 'invite' | 'memberMention' | 'channelMention' | 'roleMention' | 'emojiMention' | 'commandAlias' | 'command' | 'inhibitor' | 'listener' | (string | string[])[];

    export type CommandOptions = {
        aliases?: string[];
        args?: (ArgumentOptions | Control)[] | ArgumentOptions | Control | ArgumentFunction;
        channel?: string;
        clientPermissions?: PermissionResolvable | PermissionResolvable[] | PermissionFunction;
        condition?: ConditionFunction;
        cooldown?: number;
        defaultPrompt?: ArgumentPromptOptions;
        description?: string | string[];
        editable?: boolean;
        ownerOnly?: boolean;
        parser?: any;
        prefix?: string | string[] | PrefixFunction;
        ratelimit?: number;
        regex?: RegExp | TriggerFunction;
        typing?: boolean;
        userPermissions?: PermissionResolvable | PermissionResolvable[] | PermissionFunction;
    };

    export type CommandHandlerOptions = {
        aliasReplacement?: RegExp;
        allowMention?: boolean | AllowMentionFunction;
        blockBots?: boolean;
        blockClient?: boolean;
        blockOthers?: boolean;
        commandUtil?: boolean;
        commandUtilLifetime?: number;
        defaultCooldown?: number;
        defaultPrompt?: ArgumentPromptOptions;
        fetchMembers?: boolean;
        handleEdits?: boolean;
        ignoreCooldownID?: Snowflake | Snowflake[];
        prefix?: string | string[] | PrefixFunction;
        storeMessages?: boolean;
    };

    export type ConditionFunction = (message: Message) => boolean;

    export type InhibitorOptions = {
        reason?: string;
        type?: string;
    };

    export type ListenerOptions = {
        emitter?: string | EventEmitter;
        event?: string;
        type?: string;
    };

    export type LoadFilterFunction = (filepath: string) => boolean;

    export type AkairoModuleOptions = {
        category?: string;
    };

    export type PermissionFunction = (message: Message) => any | Promise<any>;

    export type PrefixFunction = (message: Message) => string | string[];

    export type ProviderOptions = {
        dataColumn?: string;
        idColumn?: string;
    };

    export type RegexFunction = (message: Message) => RegExp;

    export const Constants: {
        ArgumentMatches: {
            PHRASE: 'phrase',
            FLAG: 'flag',
            OPTION: 'option',
            TEXT: 'text',
            CONTENT: 'content',
            REST: 'rest',
            SEPARATE: 'separate',
            NONE: 'none'
        },
        ArgumentTypes: {
            STRING: 'string',
            LOWERCASE: 'lowercase',
            UPPERCASE: 'uppercase',
            CHAR_CODES: 'charCodes',
            NUMBER: 'number',
            INTEGER: 'integer',
            DYNAMIC: 'dynamic',
            DYNAMIC_INT: 'dynamicInt',
            URL: 'url',
            DATE: 'date',
            COLOR: 'color',
            USER: 'user',
            USERS: 'users',
            MEMBER: 'member',
            MEMBERS: 'members',
            RELEVANT: 'relevant',
            RELEVANTS: 'relevants',
            CHANNEL: 'channel',
            CHANNELS: 'channels',
            TEXT_CHANNEL: 'textChannel',
            TEXT_CHANNELS: 'textChannels',
            VOICE_CHANNEL: 'voiceChannel',
            VOICE_CHANNELS: 'voiceChannels',
            ROLE: 'role',
            ROLES: 'roles',
            EMOJI: 'emoji',
            EMOJIS: 'emojis',
            GUILD: 'guild',
            GUILDS: 'guilds',
            MESSAGE: 'message',
            GUILD_MESSAGE: 'guildMessage',
            INVITE: 'invite',
            MEMBER_MENTION: 'memberMention',
            CHANNEL_MENTION: 'channelMention',
            ROLE_MENTION: 'roleMention',
            EMOJI_MENTION: 'emojiMention',
            COMMAND_ALIAS: 'commandAlias',
            COMMAND: 'command',
            INHIBITOR: 'inhibitor',
            LISTENER: 'listener'
        },
        AkairoHandlerEvents: {
            LOAD: 'load',
            REMOVE: 'remove'
        },
        CommandHandlerEvents: {
            MESSAGE_BLOCKED: 'messageBlocked',
            MESSAGE_INVALID: 'messageInvalid',
            COMMAND_BLOCKED: 'commandBlocked',
            COMMAND_STARTED: 'commandStarted',
            COMMAND_FINISHED: 'commandFinished',
            COMMAND_CANCELLED: 'commandCancelled',
            MISSING_PERMISSIONS: 'missingPermissions',
            COOLDOWN: 'cooldown',
            IN_PROMPT: 'inPrompt',
            ERROR: 'error'
        },
        BuiltInReasons: {
            OTHERS: 'others',
            CLIENT: 'client',
            BOT: 'bot',
            OWNER: 'owner',
            GUILD: 'guild',
            DM: 'dm'
        },
        Symbols: {
            COMMAND_CANCELLED: symbol
        }
    };

    export const version: string;
}
