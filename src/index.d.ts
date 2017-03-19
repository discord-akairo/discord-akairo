declare module 'discord-akairo' {
    import { Client, ClientOptions, Collection, Message, MessageOptions, User, GuildMember, Channel, TextChannel, DMChannel, GroupDMChannel, Role, Emoji, Guild, PermissionOverwrites, RichEmbed } from 'discord.js';
    import EventEmitter from 'events';

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

        addDatabase(name: string, database: SQLiteHandler): void;
        build(): void;
        login(token: string): Promise<string>;
    }

    export class AkairoHandler<T> extends EventEmitter {
        constructor(client: AkairoClient, directory: string, classToHandle?: Function);

        client: AkairoClient;
        directory: string;
        classToHandle: Function;
        modules: Collection<string, T>;
        categories: Collection<string, Category<string, T>>;

        load(thing: string | T): T;
        add(filename: string): T;
        remove(id: string): T;
        reload(id: string): T;
        reloadAll(): void;
        findCategory(name: string): Category<string, T>;

        on(event: string, listener: Function): this;
        on(event: 'add', listener: (mod: T) => void): this;
        on(event: 'remove', listener: (mod: T) => void): this;
        on(event: 'reload', listener: (mod: T) => void): this;
        on(event: 'enable', listener: (mod: T) => void): this;
        on(event: 'disable', listener: (mod: T) => void): this;

        static readdirRecursive(directory: string): string[];
    }

    export class AkairoModule {
        constructor(id: string, exec: Function, options?: ModuleOptions);

        id: string;
        category: Category<string, AkairoModule>;
        enabled: boolean;
        filepath: string;
        client: AkairoClient;
        handler: AkairoHandler<AkairoModule>;
        
        exec(...args: any[]): any;
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
    }

    export class Command extends AkairoModule {
        constructor(id: string, exec: Function, options?: CommandOptions);

        handler: CommandHandler<Command>;
        aliases: string[];
        args: Argument[];
        split: ArgumentSplit;
        channelRestriction: string;
        ownerOnly: boolean;
        protected: boolean;
        editable: boolean;
        cooldown?: number;
        ratelimit: number;
        defaultPrompt: PromptOptions;
        options: Object;
        description: string;

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

        resolver: TypeResolver;
        preInhibitors: boolean;
        postInhibitors: boolean;
        handleEdits: boolean;
        cooldowns: Collection<string, Object>;
        prompts: Collection<string, Set<string>>;
        defaultPrompt: PromptOptions;
        defaultCooldown: number;

        prefix(message: Message): string | string[];
        allowMention(message: Message): boolean;
        findCommand(name: string): Command;
        handle(message: Message, edited: boolean): Promise<void>;

        on(event: 'add', listener: (command: Command) => void): this;
        on(event: 'remove', listener: (command: Command) => void): this;
        on(event: 'reload', listener: (command: Command) => void): this;
        on(event: 'enable', listener: (command: Command) => void): this;
        on(event: 'disable', listener: (command: Command) => void): this;
        on(event: 'messageBlocked', listener: (message: Message, reason: string) => void): this;
        on(event: 'messageInvalid', listener: (message: Message) => void): this;
        on(event: 'commandDisabled', listener: (message: Message, command: Command) => void): this;
        on(event: 'commandBlocked', listener: (message: Message, command: Command, reason: string) => void): this;
        on(event: 'commandCooldown', listener: (message: Message, command: Command, remaining: number) => void): this;
        on(event: 'commandStarted', listener: (message: Message, command: Command, edited: boolean) => void): this;
        on(event: 'commandFinished', listener: (message: Message, command: Command, edited: boolean) => void): this;
        on(event: 'inPrompt', listener: (message: Message) => void): this;
        on(event: 'error', listener: (error: Error, message: Message, command: Command) => void): this;
    }

    export class Inhibitor extends AkairoModule {
        constructor(id: string, exec: Function, options?: InhibitorOptions);

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

        on(event: 'add', listener: (command: Inhibitor) => void): this;
        on(event: 'remove', listener: (command: Inhibitor) => void): this;
        on(event: 'reload', listener: (command: Inhibitor) => void): this;
        on(event: 'enable', listener: (command: Inhibitor) => void): this;
        on(event: 'disable', listener: (command: Inhibitor) => void): this;
    }

    export class Listener extends AkairoModule {
        constructor(id: string, exec: Function, options?: ListenerOptions);

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

        register(id: string): void;
        deregister(id: string): void;

        on(event: 'add', listener: (command: Listener) => void): this;
        on(event: 'remove', listener: (command: Listener) => void): this;
        on(event: 'reload', listener: (command: Listener) => void): this;
        on(event: 'enable', listener: (command: Listener) => void): this;
        on(event: 'disable', listener: (command: Listener) => void): this;
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
        prompt(message: Message, content: string, check?: RegExp | ((message: Message) => boolean), time?: number, options?: MessageOptions): Promise<Message>;
        fetchMessage(channel: TextChannel | DMChannel | GroupDMChannel, id: string): Promise<Message>;
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
        sanitize(input: any, json?: boolean): string;
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
        on(event: 'init', listener: () => void): this;
        on(event: 'add', listener: (config: Object, memory: boolean) => void): this;
        on(event: 'remove', listener: (config: Object, memory: boolean) => void): this;
        on(event: 'set', listener: (config: Object, memory: boolean) => void): this;
        on(event: 'save', listener: (config: Object, newInsert: boolean) => void): this;
        on(event: 'saveAll', listener: () => void): this;
    }

    export class TypeResolver {
        constructor(client: AkairoClient);

        addType(name: string, resolver: (word: string, message: Message) => any): void;
    }

    type AkairoOptions = {
        ownerID?: string | string[];
        selfbot?: boolean;
        commandDirectory?: string;
        prefix?: string | string[] | ((message: Message) => string | string[]);
        allowMention?: boolean | ((message: Message) => boolean);
        handleEdits?: boolean;
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
        default?: any | ((message: Message, prevArgs: Object) => any);
        description?: string | string[];
        prompt?: PromptOptions;
    };

    type PromptOptions = {
        retries?: number;
        time?: number;
        cancelWord?: string;
        optional?: boolean;
        start: string | string[] | ((message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions);
        retry: string | string[] | ((message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions);
        timeout: string | string[] | ((message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions);
        ended: string | string[] | ((message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions);
        cancel: string | string[] | ((message: Message, prevArgs: Object, amountOfTries: number) => string | string[] | MessageOptions);
    };

    type ArgumentType = string | string[] | ((word: string, message: Message, prevArgs: Object) => any);

    type ArgumentMatch = string;

    type ArgumentSplit = string | RegExp;

    type CommandOptions = {
        aliases?: string[];
        args?: ArgumentOptions[];
        split?: ArgumentSplit;
        channelRestriction?: string;
        category?: string;
        ownerOnly?: boolean;
        protected?: boolean;
        editable?: boolean;
        cooldown?: number;
        ratelimit?: number;
        trigger?: RegExp | ((message: Message, edited: boolean) => RegExp);
        condition?: (message: Message, edited: boolean) => boolean;
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
        init?: string[] | ((client: AkairoClient) => string[]);
    };
}
