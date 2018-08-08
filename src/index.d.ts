declare module 'discord-akairo' {
    import {
        Client, ClientOptions, Collection, Message, MessageOptions, MessageEditOptions,
        User, GuildChannel, GuildMember, Channel, TextChannel, DMChannel, GroupDMChannel, Role, Emoji, Guild,
        PermissionResolvable, PermissionOverwrites, RichEmbed
    } from 'discord.js';

    import { Database, Statement } from 'sqlite';
    import { Model } from 'sequelize';
    import * as EventEmitter from 'events';

    module 'discord.js' {
        export interface Message {
            util?: CommandUtil;
        }
    }

    export class AkairoClient extends Client {
        public constructor(options: AkairoOptions, clientOptions: ClientOptions);

        public akairoOptions: AkairoOptions;
        public commandHandler: CommandHandler;
        public databases: Object;
        public inhibitorHandler: InhibitorHandler;
        public listenerHandler: ListenerHandler;
        public mem: Object;
        public ownerID: string | string[];
        public selfbot: boolean;
        public util: ClientUtil;

        public addDatabase(name: string, database: SQLiteHandler): this;
        public build(): this;
        public loadAll(): void;
        public login(token: string): Promise<string>;
    }

    export class AkairoHandler extends EventEmitter {
        public constructor(client: AkairoClient, directory: string, classToHandle: Function);

        public categories: Collection<string, Category<string, AkairoModule>>;
        public readonly classToHandle: Function;
        public readonly client: AkairoClient;
        public readonly directory: string;
        public modules: Collection<string, AkairoModule>;

        public static readdirRecursive(directory: string): string[];

        protected _apply(mod: AkairoModule, filepath?: string): void;
        protected _unapply(mod: AkairoModule): void;

        public add(filename: string): AkairoModule;
        public findCategory(name: string): Category<string, AkairoModule>;
        public load(thing: string | AkairoModule, isReload?: boolean): AkairoModule;
        public loadAll(): this;
        public reload(id: string): AkairoModule;
        public reloadAll(): this;
        public remove(id: string): AkairoModule;
        public removeAll(): this;
        public on(event: 'add' | 'disable' | 'enable' | 'load' | 'reload' | 'remove', listener: (mod: AkairoModule) => any): this;
    }

    export class AkairoModule {
        public constructor(id: string, exec: (...args: any[]) => any, options?: ModuleOptions);
        
        public category: Category<string, AkairoModule>;
        public readonly client: AkairoClient;
        public enabled: boolean;
        public readonly filepath: string;
        public readonly handler: AkairoHandler;
        public id: string;

        public disable(): boolean;
        public enable(): boolean;
        public exec(...args: any[]): any;
        public reload(): this;
        public remove(): this;
    }

    export class Argument {
        public constructor(command: Command, options: ArgumentOptions);

        public readonly client: AkairoClient;
        public command: Command;
        public description: string;
        public readonly handler: CommandHandler;
        public id: string;
        public index?: number;
        public match: ArgumentMatch;
        public prefix?: string | string[];
        public prompt?: ArgumentPromptOptions;
        public type: ArgumentType;

        private _processType(word: string, message: Message, args: any): any;
        private _promptArgument(message: Message, args: any): Promise<any>;

        public cast(word: string, message: Message, args: any): Promise<any>;
        public default(message: Message, args: any): any;
    }

    export class Category<K, V> extends Collection<K, V> {
        public constructor(id: string, iterable: Iterable<Array<[K, V]>>);

        public id: string;

        public disableAll(): this;
        public enableAll(): this;
        public reloadAll(): this;
        public removeAll(): this;
    }

    export class ClientUtil {
        public constructor(client: AkairoClient);

        public readonly client: AkairoClient;

        public checkChannel(text: string, channel: Channel, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkEmoji(text: string, emoji: Emoji, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkGuild(text: string, guild: Guild, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkMember(text: string, member: GuildMember, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkRole(text: string, role: Role, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkUser(text: string, user: User, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public collection<K, V>(iterable: Iterable<Array<[K, V]>>): Collection<K, V>;
        public compareStreaming(oldMember: GuildMember, newMember: GuildMember): number;
        public displayColor(member: GuildMember): number;
        public displayHexColor(member: GuildMember): string;
        public displayRole(member: GuildMember): Role;
        public embed(data?: any): RichEmbed;
        public fetchMemberFrom(guild: Guild, id: string, cache?: boolean): Promise<GuildMember>;
        public fetchMessage(channel: TextChannel | DMChannel | GroupDMChannel, id: string): Promise<Message>;
        public hoistRole(member: GuildMember): Role;
        public permissionNames(): string[];
        public prompt(message: Message, content?: string, check?: RegExp | PromptCheckFunction, time?: number, options?: MessageOptions): Promise<Message>;
        public promptIn(channel: TextChannel | DMChannel | GroupDMChannel | User, user?: User, content?: string, check?: RegExp | PromptCheckFunction, time?: number, options?: MessageOptions): Promise<Message>;
        public resolveChannel(text: string, channels: Collection<any, GuildChannel>, caseSensitive?: boolean, wholeWord?: boolean): GuildChannel;
        public resolveChannels(text: string, channels: Collection<any, GuildChannel>, caseSensitive?: boolean, wholeWord?: boolean): Collection<any, GuildChannel>;
        public resolveEmoji(text: string, emojis: Collection<any, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Emoji;
        public resolveEmojis(text: string, emojis: Collection<any, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Collection<any, Emoji>;
        public resolveGuild(text: string, guilds: Collection<any, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Guild;
        public resolveGuilds(text: string, guilds: Collection<any, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Collection<any, Guild>;
        public resolveMember(text: string, members: Collection<any, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): GuildMember;
        public resolveMembers(text: string, members: Collection<any, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): Collection<any, GuildMember>;
        public resolvePermissionNumber(number: number): string[];
        public resolvePermissionOverwrite(overwrite: PermissionOverwrites): PermissionOverwrites & { allow: string[], deny: string[] };
        public resolveRole(text: string, roles: Collection<any, Role>, caseSensitive?: boolean, wholeWord?: boolean): Role;
        public resolveRoles(text: string, roles: Collection<any, Role>, caseSensitive?: boolean, wholeWord?: boolean): Collection<any, Role>;
        public resolveUser(text: string, users: Collection<any, User>, caseSensitive?: boolean, wholeWord?: boolean): User;
        public resolveUsers(text: string, users: Collection<any, User>, caseSensitive?: boolean, wholeWord?: boolean): Collection<any, User>;
    }

    export class Command extends AkairoModule {
        public constructor(id: string, exec: CommandExecFunction | RegexCommandExecFunction | ConditionalCommandExecFunction | CommandOptions, options?: CommandOptions);

        public aliases: string[];
        public args: Argument[];
        public category: Category<string, Command>;
        public channelRestriction?: string;
        public readonly client: AkairoClient;
        public clientPermissions: PermissionResolvable | PermissionResolvable[] | PermissionFunction;
        public cooldown?: number;
        public defaultPrompt: ArgumentPromptOptions;
        public description: string;
        public editable: boolean;
        public readonly filepath: string;
        public readonly handler: CommandHandler;
        public id: string;
        public options: any;
        public ownerOnly: boolean;
        public prefix?: string | string[] | PrefixFunction;
        public protected: boolean;
        public ratelimit: number;
        public split: ArgumentSplit;
        public typing: boolean;
        public userPermissions: PermissionResolvable | PermissionResolvable[] | PermissionFunction;

        public condition(message): boolean;
        public disable(): boolean;
        public enable(): boolean;
        public exec(message: Message, args: any, edited: boolean): any;
        public exec(message: Message, match: string | RegExpMatchArray, groups: RegExpMatchArray[] | void, edited: boolean): any;
        public exec(message: Message, edited: boolean): any;
        public parse(content: string, message: Message): Promise<any>;
        public reload(): this;
        public remove(): this;
        public trigger(message: Message): RegExp | void; 
    }

    export class CommandHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoOptions);

        public aliases: Collection<string, string>;
        public blockBots: boolean;
        public blockClient: boolean;
        public blockNotSelf: boolean;
        public categories: Collection<string, Category<string, Command>>;
        public readonly classToHandle: Function;
        public readonly client: AkairoClient;
        public commandUtil: boolean;
        public commandUtilLifetime: number;
        public commandUtils: Collection<string, CommandUtil>;
        public cooldowns: Collection<string, any>;
        public defaultCooldown: number;
        public defaultPrompt: ArgumentPromptOptions;
        public readonly directory: string;
        public fetchMembers: boolean;
        public handleEdits: boolean;
        public modules: Collection<string, Command>;
        public prefixes: Set<string | string[] | PrefixFunction>;
        public prompts: Collection<string, Set<any>>;
        public resolver: TypeResolver;

        private _addAliases(command: Command): void;
        private _handleConditional(message: Message, edited: boolean): Promise<void>;
        private _handleCooldowns(message: Message, command: Command): boolean;
        private _handleError(err: Error, message: Message, command?: Command): void;
        private _handleRegex(message: Message, edited: boolean): Promise<void>;
        private _handleTriggers(message: Message, edited: boolean): Promise<void>;
        private _parseCommand(message: Message): any;
        private _removeAliases(command: Command): void;
        private _runInhibitors(message: Message, command: Command): boolean;

        protected _apply(command: Command, filepath?: string): void;
        protected _unapply(command: Command): void;

        public add(filename: string): Command;
        public addPrompt(message: Message): void;
        public allowMention(message: Message): boolean;
        public findCategory(name: string): Category<string, Command>;
        public findCommand(name: string): Command;
        public handle(message: Message, edited: boolean): Promise<void>;
        public hasPrompt(message: Message): boolean;
        public load(thing: string | Command): Command;
        public loadAll(): this;
        public prefix(message: Message): string | string[];
        public reload(id: string): Command;
        public reloadAll(): this;
        public remove(id: string): Command;
        public removeAll(): this;
        public removePrompt(message: Message): void;
        public on(event: 'add' | 'disable' | 'enable' | 'load' | 'reload' | 'remove', listener: (command: Command) => any): this;
        public on(event: 'commandBlocked', listener: (message: Message, command: Command, reason: string) => any): this;
        public on(event: 'commandCooldown', listener: (message: Message, command: Command, remaining: number) => any): this;
        public on(event: 'commandDisabled', listener: (message: Message, command: Command) => any): this;
        public on(event: 'commandFinished' | 'commandStarted', listener: (message: Message, command: Command, edited: boolean) => any): this;
        public on(event: 'error', listener: (error: Error, message: Message, command: Command) => any): this;
        public on(event: 'inPrompt' | 'messageInvalid', listener: (message: Message) => any): this;
        public on(event: 'messageBlocked', listener: (message: Message, reason: string) => any): this;
    }

    export class CommandUtil {
        public constructor(client: AkairoClient, message: Message, command: Command, prefix?: string, alias?: string);

        public alias?: string;
        public readonly client: AkairoClient;
        public command: Command;
        public lastResponse?: Message;
        public message: Message;
        public prefix?: string;
        public shouldEdit: boolean;

        public static swapOptions(content: string | MessageOptions | MessageEditOptions, options?: MessageOptions | MessageEditOptions): any[];

        public edit(content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message>;
        public reply(content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message | Message[]>;
        public send(content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message | Message[]>;
        public sendCode(code: string, content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message | Message[]>;
        public sendEmbed(embed: RichEmbed, content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message | Message[]>;
        public sendMessage(content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message | Message[]>;
        public setLastResponse(message: Message | Message[]): void;
    }

    export class Inhibitor extends AkairoModule {
        public constructor(id: string, exec: ((message: Message, command?: Command) => boolean | Promise<any>) | InhibitorOptions, options?: InhibitorOptions);

        public category: Category<string, Inhibitor>;
        public readonly client: AkairoClient;
        public enabled: boolean;
        public readonly filepath: string;
        public readonly handler: InhibitorHandler;
        public id: string;
        public reason: string;
        public type: string;

        public disable(): boolean;
        public enable(): boolean;
        public exec(message: Message, command?: Command): boolean | Promise<any>;
        public reload(): this;
        public remove(): this;
    }

    export class InhibitorHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoOptions);

        public categories: Collection<string, Category<string, Inhibitor>>;
        public readonly classToHandle: Function;
        public readonly client: AkairoClient;
        public readonly directory: string;
        public modules: Collection<string, Inhibitor>;

        protected _apply(inhibitor: Inhibitor, filepath?: string): void;
        protected _unapply(inhibitor: Inhibitor): void;

        public add(filename: string): Inhibitor;
        public findCategory(name: string): Category<string, Inhibitor>;
        public load(thing: string | Inhibitor): Inhibitor;
        public loadAll(): this;
        public reload(id: string): Inhibitor;
        public reloadAll(): this;
        public remove(id: string): Inhibitor;
        public removeAll(): this;
        public test(type: 'all' | 'pre' | 'post', message: Message, command?: Command): Promise<void[]>;
        public on(event: 'add' | 'disable' | 'enable' | 'load' | 'reload' | 'remove', listener: (inhibitor: Inhibitor) => any): this;
    }

    export class Listener extends AkairoModule {
        public constructor(id: string, exec: ((...args: any[]) => any) | ListenerOptions, options?: ListenerOptions);

        public category: Category<string, Inhibitor>;
        public readonly client: AkairoClient;
        public emitter: string | EventEmitter;
        public enabled: boolean;
        public eventName: string;
        public readonly filepath: string;
        public readonly handler: InhibitorHandler;
        public type: string;

        public disable(): boolean;
        public enable(): boolean;
        public exec(...args: any[]): any;
        public reload(): this;
        public remove(): this;
    }

    export class ListenerHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoOptions);

        public categories: Collection<string, Category<string, Inhibitor>>;
        public readonly classToHandle: Function;
        public readonly client: AkairoClient;
        public readonly directory: string;
        public emitters: Collection<string, EventEmitter>;
        public modules: Collection<string, Inhibitor>;

        protected _apply(listener: Listener, filepath?: string): void;
        protected _unapply(listener: Listener): void;

        public add(filename: string): Listener;
        public deregister(id: string): Listener;
        public findCategory(name: string): Category<string, Listener>;
        public load(thing: string | Listener): Listener;
        public loadAll(): this;
        public register(id: string): Listener;
        public reload(id: string): Listener;
        public reloadAll(): this;
        public remove(id: string): Listener;
        public removeAll(): this;
        public test(type: 'all' | 'pre' | 'post', message: Message, command?: Command): Promise<void[]>;
        public on(event: 'add' | 'disable' | 'enable' | 'load' | 'reload' | 'remove', listener: (listener: Listener) => any): this;
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

        public clear(id: string): Promise<void>;
        public delete(id: string, key: string): Promise<boolean>;
        public get(id: string, key: string, defaultValue: any): any;
        public init(): Promise<void>;
        public set(id: string, key: string, value: any): Promise<boolean>;
    }

    export class SQLiteHandler extends EventEmitter {
        public constructor(filepath: string, options?: SQLiteOptions);

        public readonly client: AkairoClient;
        public configs: any[];
        public db: Database;
        public defaultConfig: any;
        public filepath: string;
        public ids: string[];
        public json: string[];
        public memory: Collection<string, any>;
        public tableName: string;

        public add(id: string): Promise<this>;
        public addMemory(id: string): this;
        public desanitize(input: string, json?: boolean): any;
        public get(id: string, keys?: string[]): any;
        public has(id: string): boolean;
        public init(client: AkairoClient): string[];
        public load(ids: string[]): Promise<this>;
        public open(): Promise<Database>;
        public remove(id: string): Promise<this>;
        public removeMemory(id: string): this;
        public sanitize(input: string, json?: boolean): any;
        public save(id: string): Promise<this>;
        public saveAll(): Promise<this>;
        public set(id: string, key: string, value: any): Promise<this>;
        public setMemory(id: string, key: string, value: any): this;
        public on(event: 'add' | 'set', listener: (config: any, memory: boolean) => any): this;
        public on(event: 'init' | 'saveAll', listener: () => any): this;
        public on(event: 'remove', listener: (id: string, memory: boolean) => any): this;
        public on(event: 'save', listener: (config: any, newInsert: boolean) => any): this;
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

        public readonly client: AkairoClient;
        public handler: CommandHandler;

        public addType(name: string, resolver: ArgumentTypeFunction): this;
        public addTypes(types: { [x: string]: ArgumentTypeFunction }): this;
        public type(name: string): ArgumentTypeFunction;
    }

    export type AkairoOptions = {
        ownerID?: string | string[];
        selfbot?: boolean;
        commandDirectory?: string;
        prefix?: string | string[] | PrefixFunction;
        allowMention?: boolean | AllowMentionFunction;
        handleEdits?: boolean;
        commandUtil?: boolean;
        commandUtilLifetime?: number;
        fetchMembers?: boolean;
        defaultCooldown?: number;
        defaultPrompt?: ArgumentPromptOptions;
        inhibitorDirectory?: string;
        blockNotSelf?: boolean;
        blockClient?: boolean;
        blockBots?: boolean;
        listenerDirectory?: string;
        emitters?: { [x: string]: EventEmitter };
        automateCategories?: boolean;
    };

    export type AllowMentionFunction = (message: Message) => boolean;

    export type ArgumentDefaultFunction = (message: Message, args: any) => any;

    export type ArgumentMatch = 'word' | 'rest' | 'prefix' | 'flag' | 'text' | 'content' | 'none';

    export type ArgumentMatchFunction = (message: Message, args: any) => ArgumentMatch;

    export type ArgumentOptions = {
        id: string;
        match?: ArgumentMatch | ArgumentMatchFunction;
        type?: ArgumentType | ArgumentTypeFunction;
        prefix?: string | string[];
        index?: number;
        default?: ArgumentDefaultFunction | any;
        description?: string | string[];
        prompt?: ArgumentPromptOptions;
    };

    export type ArgumentPromptFunction = (message: Message, args: any, tries: number) => (string | string[] | MessageOptions);

    export type ArgumentPromptOptions = {
        retries?: number;
        time?: number;
        cancelWord?: string;
        stopWord?: string;
        optional?: boolean;
        infinite?: boolean;
        limit?: number;
        start?: string | string[] | ArgumentPromptFunction;
        retry?: string | string[] | ArgumentPromptFunction;
        timeout?: string | string[] | ArgumentPromptFunction;
        ended?: string | string[] | ArgumentPromptFunction;
        cancel?: string | string[] | ArgumentPromptFunction;
    };

    export type ArgumentSplit = 'plain' | 'split' | 'quoted' | 'sticky' | 'none' | string | RegExp;

    export type ArgumentSplitFunction = (content: string, message: Message) => string[];

    export type ArgumentType = 'string' | 'lowercase' | 'uppercase' | 'charCodes' | 'number' | 'integer' | 'dynamic' | 'dynamicInt' | 'url' | 'date' | 'color' | 'user' | 'users' | 'member' | 'members' | 'relevant' | 'relevants' | 'channel' | 'channels' | 'textChannel' | 'textChannels' | 'voiceChannel' | 'voiceChannels' | 'role' | 'roles' | 'emoji' | 'emojis' | 'guild' | 'guilds' | 'message' | 'invite' | 'memberMention' | 'channelMention' | 'roleMention' | 'emojiMention' | 'commandAlias' | 'command' | 'inhibitor' | 'listener' | string[];

    export type ArgumentTypeFunction = (word: string, message: Message, args: any) => any;

    export type CommandExecFunction = (message: Message, args: any, edited: boolean) => any;

    export type CommandOptions = {
        aliases?: string[];
        args?: ArgumentOptions[];
        split?: ArgumentSplit | ArgumentSplitFunction;
        channelRestriction?: string;
        category?: string;
        ownerOnly?: string;
        protected?: string;
        typing?: boolean;
        editable?: boolean;
        cooldown?: number;
        ratelimit?: number;
        prefix?: string | string[] | PrefixFunction;
        userPermissions?: PermissionResolvable | PermissionResolvable[] | PermissionFunction;
        clientPermissions?: PermissionResolvable | PermissionResolvable[] | PermissionFunction;
        trigger?: RegExp | TriggerFunction;
        condition?: ConditionFunction;
        defaultPrompt?: ArgumentPromptOptions;
        options?: any;
        description?: string | string[];
    };

    export type ConditionalCommandExecFunction = (message: Message, edited: boolean) => any;

    export type ConditionFunction = (message: Message) => any;

    export type InhibitorOptions = {
        reason?: string;
        type?: boolean;
        category?: string;
    };

    export type ListenerOptions = {
        emitter?: string | EventEmitter;
        eventName?: string;
        type?: string;
        category?: string;
    };

    export type ModuleOptions = {
        category?: string;
    };

    export type PermissionFunction = (message: Message) => boolean;

    export type PrefixFunction = (message: Message) => boolean;

    export type PromptCheckFunction = (message: Message, sent: Message) => boolean;

    export type ProviderOptions = {
        idColumn?: string;
        dataColumn?: string;
    };

    export type RegexCommandExecFunction = (match: string | RegExpMatchArray, groups: RegExpMatchArray[] | void, edited: boolean) => any;

    export type SQLiteInitFunction = (client: AkairoClient) => string[];

    export type SQLiteOptions = {
        tableName?: string;
        defaultConfig?: any;
        json?: string[];
        init?: string[] | SQLiteInitFunction;
    };

    export type TriggerFunction = (message: Message) => RegExp;

    export const version: string;
}
