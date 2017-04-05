declare module 'discord-akairo' {
    import { Client, ClientOptions, Collection, Message, MessageOptions, User, GuildMember, Channel, TextChannel, DMChannel, GroupDMChannel, Role, Emoji, Guild, PermissionResolvable, PermissionOverwrites, RichEmbed } from 'discord.js';
    import EventEmitter from 'events';

    module 'discord.js' {
        export interface Message {
            util?: CommandUtil;
        }
    }

    export const version: string;

    export class AkairoClient extends Client {
        constructor(options?: AkairoOptions, clientOptions?: ClientOptions);

        ownerID: string;
        selfbot: boolean;
        mem: Object;
        util: ClientUtil;
        databases: Object;
        commandHandler: CommandHandler<Command>;
        inhibitorHandler: InhibitorHandler<Inhibitor>;
        listenerHandler: ListenerHandler<Listener>;

        addDatabase(name: string, database: SQLiteHandler): this;
        build(): this;
        login(token: string): Promise<string>;
    }

    export class AkairoHandler<T> extends EventEmitter {
        constructor(client: AkairoClient, directory: string, classToHandle?: Function);

        client: AkairoClient;
        directory: string;
        classToHandle: Function;
        modules: Collection<string, T>;
        categories: Collection<string, Category<string, T>>;

        loadAll(): void;
        load(thing: string | T, isReload?: boolean): T;
        add(filename: string): T;
        remove(id: string): T;
        reload(id: string): T;
        reloadAll(): this;
        findCategory(name: string): Category<string, T>;

        on(event: string, listener: (this: this) => any): this;
        on(event: 'add', listener: (this: this, mod: T) => any): this;
        on(event: 'remove', listener: (this: this, mod: T) => any): this;
        on(event: 'reload', listener: (this: this, mod: T) => any): this;
        on(event: 'enable', listener: (this: this, mod: T) => any): this;
        on(event: 'disable', listener: (this: this, mod: T) => any): this;

        _apply(mod: T, filepath?: string): void;
        _unapply(mod: T): void;

        static readdirRecursive(directory: string): string[];
    }

    export class AkairoModule {
        constructor(id: string, exec: (this: AkairoModule, ...args: any[]) => any, options?: ModuleOptions);

        id: string;
        category: Category<string, AkairoModule>;
        enabled: boolean;
        filepath: string;
        client: AkairoClient;
        handler: AkairoHandler<AkairoModule>;

        exec(this: AkairoModule, ...args: any[]): any;
        reload(): AkairoModule;
        remove(): AkairoModule;
        enable(): boolean;
        disable(): boolean;
    }

    export class Argument {
        constructor(command: Command, options: ArgumentOptions);

        id: string;
        command: Command;
        match: ArgumentMatch;
        type: ArgumentType;
        prefix?: string;
        index?: number;
        description: string;
        prompt: PromptOptions;
        client: AkairoClient;
        handler: CommandHandler<Command>;

        default(message: Message): any;
        cast(word: string, message: Message): Promise<any>;

        _processType(word: string, message: Message, args: Object): any;
        _promptArgument(message: Message, args: Object): Promise<any>;
    }

    export class Command extends AkairoModule {
        constructor(id: string, exec: ((this: Command, message: Message, args: Object, edited: boolean) => any) | ((this: Command, message: Message, match: string[], groups: string[] | null, edited: boolean) => any) | ((this: Command, message: Message, edited: boolean) => any), options?: CommandOptions);

        handler: CommandHandler<Command>;
        aliases: string[];
        args: Argument[];
        split: ArgumentSplit;
        channelRestriction: string;
        ownerOnly: boolean;
        protected: boolean;
        typing: boolean;
        editable: boolean;
        cooldown?: number;
        ratelimit: number;
        permissions?: PermissionResolvable[] | ((message: Message) => boolean);
        defaultPrompt: PromptOptions;
        options: Object;
        description: string;
        prefix: string | string[] | ((this: CommandHandler<Command>, message: Message) => string | string[]);

        trigger(message: Message): RegExp;
        condition(message: Message): boolean;
        exec(message: Message, args: Object, edited: boolean): any;
        exec(message: Message, match: string[], groups: string[] | null, edited: boolean): any;
        exec(message: Message, edited: boolean): any;
        reload(): Command;
        remove(): Command;
        parse(content: string, message?: Message): Promise<Object>;
    }

    export class CommandHandler<Command> extends AkairoHandler<Command> {
        constructor(client: AkairoClient, options: Object);

        aliases: Collection<string, string>;
        prefixes: Set<string | string[] | Function>;
        resolver: TypeResolver;
        blockNotSelf: boolean;
        blockClient: boolean;
        blockBots: boolean;
        fetchMembers: boolean;
        handleEdits: boolean;
        commandUtil: boolean;
        commandUtils: Collection<string, CommandUtil>
        cooldowns: Collection<string, Object>;
        defaultCooldown: number;
        prompts: Collection<string, Set<string>>;
        defaultPrompt: PromptOptions;
        
        prefix(message: Message): string | string[];
        allowMention(message: Message): boolean;
        findCommand(name: string): Command;
        handle(message: Message, edited: boolean): Promise<void>;

        on(event: string, listener: (this: this) => any): this;
        on(event: 'messageBlocked', listener: (this: this, message: Message, reason: string) => any): this;
        on(event: 'messageInvalid', listener: (this: this, message: Message) => any): this;
        on(event: 'commandDisabled', listener: (this: this, message: Message, command: Command) => any): this;
        on(event: 'commandBlocked', listener: (this: this, message: Message, command: Command, reason: string) => any): this;
        on(event: 'commandCooldown', listener: (this: this, message: Message, command: Command, remaining: number) => any): this;
        on(event: 'commandStarted', listener: (this: this, message: Message, command: Command, edited: boolean) => any): this;
        on(event: 'commandFinished', listener: (this: this, message: Message, command: Command, edited: boolean) => any): this;
        on(event: 'inPrompt', listener: (this: this, message: Message) => any): this;
        on(event: 'error', listener: (this: this, error: Error, message: Message, command: Command) => any): this;

        _addAliases(command: Command): void;
        _removeAliases(command: Command): void;
        _parseCommand(message: Message): Object;
        _handleCooldowns(message: Message, command: Command): boolean;
        _handleTriggers(message: Message, edited: boolean): Promise<void>;
        _handleError(err: Error, message: Message, command: Command): void;
    }

    export class Inhibitor extends AkairoModule {
        constructor(id: string, exec: (this: Inhibitor, message: Message, command: Command) => any, options?: InhibitorOptions);

        handler: InhibitorHandler<Inhibitor>;
        reason: string;
        type: string;

        exec(message: Message, command: Command): boolean | Promise<any>;
        reload(): Inhibitor;
        remove(): Inhibitor;
    }

    export class InhibitorHandler<Inhibitor> extends AkairoHandler<Inhibitor> {
        constructor(client: AkairoClient, options: Object);

        testMessage(message: Message): Promise<void>;
        testCommand(message: Message, command: Command): Promise<void>;
    }

    export class Listener extends AkairoModule {
        constructor(id: string, exec: (this: Listener, ...args: any[]) => any, options?: ListenerOptions);

        handler: ListenerHandler<Listener>;
        emitter: EventEmitter;
        eventName: string;
        type: string;

        reload(): Listener;
        remove(): Listener;
    }

    export class ListenerHandler<Listener> extends AkairoHandler<Listener> {
        constructor(client: AkairoClient, options: Object);

        emitters: Collection<string, EventEmitter>;

        register(id: string): Listener;
        deregister(id: string): Listener;
    }

    export class Category<K, V> extends Collection<K, V> {
        constructor(id: string, iterable: Iterable<any>);

        reloadAll(): this;
        removeAll(): this;
        enableAll(): this;
        disableAll(): this;
    }

    export class ClientUtil {
        constructor(client: AkairoClient);

        resolveUser(text: string, users: Collection<string, User>, caseSensitive?: boolean, wholeWord?: boolean): User;
        resolveUsers(text: string, users: Collection<string, User>, caseSensitive?: boolean, wholeWord?: boolean): Collection<string, User>;
        checkUser(text: string, user: User, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        resolveMember(text: string, members: Collection<string, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): GuildMember;
        resolveMembers(text: string, members: Collection<string, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): Collection<string, GuildMember>;
        checkMember(text: string, member: GuildMember, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        resolveChannel(text: string, channels: Collection<string, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Channel;
        resolveChannels(text: string, channels: Collection<string, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Collection<string, Channel>;
        checkChannel(text: string, channel: Channel, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        resolveRole(text: string, roles: Collection<string, Role>, caseSensitive?: boolean, wholeWord?: boolean): Role;
        resolveRoles(text: string, roles: Collection<string, Role>, caseSensitive?: boolean, wholeWord?: boolean): Collection<string, Role>;
        checkRole(text: string, role: Role, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        resolveEmoji(text: string, emojis: Collection<string, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Emoji;
        resolveEmojis(text: string, emojis: Collection<string, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Collection<string, Emoji>;
        checkEmoji(text: string, emoji: Emoji, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        resolveGuild(text: string, guilds: Collection<string, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Guild;
        resolveGuilds(text: string, guilds: Collection<string, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Collection<string, Guild>;
        checkGuild(text: string, guild: Guild, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        displayRole(member: GuildMember): Role;
        displayColor(member: GuildMember): number;
        displayHexColor(member: GuildMember): string;
        hoistRole(member: GuildMember): Role;
        permissionNames(): string[];
        resolvePermissionNumber(number: number): string[];
        resolvePermissionOverwrites(overwrite: PermissionOverwrites): Object;
        compareStreaming(oldMember: GuildMember, newMember: GuildMember): number;
        fetchMemberFrom(guild: Guild, id: string, cache?: boolean): Promise<GuildMember>
        embed(data: Object): RichEmbed;
        collection(iterable: Iterable<any>): Collection<any, any>;
        prompt(message: Message, content?: string, check?: RegExp | ((this: ClientUtil, message: Message) => boolean), time?: number, options?: MessageOptions): Promise<Message>;
        promptIn(channel: TextChannel | DMChannel | GroupDMChannel | User, user?: User, content?: string, check?: RegExp | ((this: ClientUtil, message: Message) => boolean), time?: number, options?: MessageOptions): Promise<Message>;
        fetchMessage(channel: TextChannel | DMChannel | GroupDMChannel, id: string): Promise<Message>;
    }

    export class CommandUtil {
        constructor(client: AkairoClient, message: Message, command: Command, prefix: string, alias: string);

        client: AkairoClient;
        message: Message;
        command: Command;
        prefix: string;
        alias: string;
        shouldEdit: boolean;
        lastResponse?: Message;

        setLastResponse(message: Message | Message[]): void;
        send(content: string | MessageOptions, options?: MessageOptions): Promise<Message | Message[]>;
        sendMessage(content: string | MessageOptions, options?: MessageOptions): Promise<Message | Message[]>;
        sendCode(code: string, content: string | MessageOptions, options?: MessageOptions): Promise<Message | Message[]>;
        sendEmbed(embed: RichEmbed | Object, content: string | MessageOptions, options?: MessageOptions): Promise<Message | Message[]>;
        reply(content: string | MessageOptions, options?: MessageOptions): Promise<Message | Message[]>;

        static swapOptions(content: string | MessageOptions, options?: MessageOptions): any[];
    }

    export class SQLiteHandler extends EventEmitter {
        constructor(filepath: string, options?: SQLiteOptions);

        filepath: string;
        tableName: string;
        defaultConfig: Object;
        json: string[];
        db: Object;
        memory: Collection<string, Object>;
        ids: string[];
        configs: Object[];

        init(client: AkairoClient): string[];
        sanitize(input: any, json?: boolean): any;
        desanitize(input: any, json?: boolean): any;
        open(): Promise<Object>
        load(ids: string[]): Promise<this>;
        add(id: string): Promise<this>;
        addMemory(id: string): this;
        remove(id: string): Promise<this>;
        removeMemory(id: string): this;
        has(id: string): boolean;
        get(id: string): Object;
        set(id: string, key: string, value: string | number): Promise<this>;
        setMemory(id: string, key: string, value: string | number): this;
        save(id: string): Promise<this>;
        saveAll(): Promise<this>;

        on(event: string, listener: Function): this;
        on(event: 'init', listener: (this: SQLiteHandler) => void): this;
        on(event: 'add', listener: (this: SQLiteHandler, config: Object, memory: boolean) => void): this;
        on(event: 'remove', listener: (this: SQLiteHandler, config: Object, memory: boolean) => void): this;
        on(event: 'set', listener: (this: SQLiteHandler, config: Object, memory: boolean) => void): this;
        on(event: 'save', listener: (this: SQLiteHandler, config: Object, newInsert: boolean) => void): this;
        on(event: 'saveAll', listener: (this: SQLiteHandler) => void): this;
    }

    export class TypeResolver {
        constructor(client: AkairoClient);

        client: AkairoClient;

        addType(name: string, resolver: (this: TypeResolver, word: string, message: Message, prevArgs: Object) => any): this;
        addTypes(types: Object): this;
    }

    type AkairoOptions = {
        ownerID?: string | string[];
        selfbot?: boolean;
        commandDirectory?: string;
        prefix?: string | string[] | ((this: CommandHandler<Command>, message: Message) => string | string[]);
        allowMention?: boolean | ((this: CommandHandler<Command>, message: Message) => boolean);
        handleEdits?: boolean;
        commandUtil?: boolean;
        fetchMembers?: boolean;
        defaultCooldown?: number;
        defaultPrompt?: PromptOptions;
        inhibitorDirectory?: string;
        blockNotSelf?: boolean;
        blockClient?: boolean;
        blockBots?: boolean;
        listenerDirectory?: string;
        emitters?: Object;
    };

    type ModuleOptions = {
        category?: string;
    };

    type ArgumentOptions = {
        id: string;
        match?: ArgumentMatch;
        type?: ArgumentType;
        prefix?: string | string[];
        index?: number;
        default?: any | ((this: Command, message: Message, prevArgs: Object) => any);
        description?: string | string[];
        prompt?: PromptOptions;
    };

    type PromptOptions = {
        retries?: number;
        time?: number;
        cancelWord?: string;
        stopWord?: string;
        optional?: boolean;
        infinite?: boolean;
        start: string | string[] | ((this: Argument, message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions & { content: string | string[] });
        retry: string | string[] | ((this: Argument, message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions & { content: string | string[] });
        timeout: string | string[] | ((this: Argument, message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions & { content: string | string[] });
        ended: string | string[] | ((this: Argument, message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions & { content: string | string[] });
        cancel: string | string[] | ((this: Argument, message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions & { content: string | string[] });
    };

    type ArgumentType = string | string[] | RegExp | ((this: Command, word: string, message: Message, prevArgs: Object) => any);

    type ArgumentMatch = string | ((this: Command, message: Message, prevArgs: Object) => string);

    type ArgumentSplit = string | RegExp | ((this: Command, content: string, message: Message) => string[]);

    type CommandOptions = {
        aliases?: string[];
        args?: ArgumentOptions[];
        split?: ArgumentSplit;
        channelRestriction?: string;
        category?: string;
        ownerOnly?: boolean;
        protected?: boolean;
        typing?: boolean;
        editable?: boolean;
        cooldown?: number;
        ratelimit?: number;
        permissions?: PermissionResolvable[] | ((this: Command, message: Message) => boolean);
        prefix?: string | string[] | Function;
        trigger?: RegExp | ((this: Command, message: Message, edited: boolean) => RegExp);
        condition?: (this: Command, message: Message, edited: boolean) => boolean;
        defaultPrompt?: PromptOptions;
        options?: Object;
        description?: string | string[];
    };

    type InhibitorOptions = {
        reason?: string;
        type?: string;
        category?: string;
    };

    type ListenerOptions = {
        emitter?: string;
        eventName?: string;
        type?: string;
        category?: string;
    }

    type SQLiteOptions = {
        tableName?: string;
        defaultConfig?: Object;
        json?: string[];
        init?: string[] | ((this: SQLiteHandler, client: AkairoClient) => string[]);
    };
}
