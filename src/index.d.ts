declare module 'discord-akairo' {
    import { Client, ClientOptions, Collection, Message, MessageOptions, User, GuildMember, Channel, Role, Emoji, Guild, PermissionOverwrites, RichEmbed } from 'discord.js';
    import EventEmitter from 'events';

    export const version: string;

    export class AkairoClient extends Client {
        constructor(options?: AkairoOptions, clientOptions?: ClientOptions);

        ownerID: string;
        selfbot: boolean;
        mem: Object;
        util: ClientUtil;
        databases: Object;

        addDatabase(name: string, database: SQLiteHandler): void;
        login(token: string): Promise<string>;
    }

    export class AkairoHandler extends EventEmitter {
        constructor(client: AkairoClient, directory: string, classToHandle?: Function);

        client: AkairoClient;
        directory: string;
        classToHandle: Function;
        modules: Collection<string, AkairoModule>;
        categories: Collection<string, Category<string, AkairoModule>>;

        load(filepath: string): AkairoModule;
        add(filename: string): AkairoModule;
        remove(id: string): AkairoModule;
        reload(id: string): AkairoModule;
        reloadAll(): void;
        findCategory(name: string): Category<string, AkairoModule>;

        on(event: string, listener: Function): this;
        on(event: 'add', listener: (mod: AkairoModule) => void): this;
        on(event: 'remove', listener: (mod: AkairoModule) => void): this;
        on(event: 'reload', listener: (mod: AkairoModule) => void): this;
        on(event: 'enable', listener: (mod: AkairoModule) => void): this;
        on(event: 'disable', listener: (mod: AkairoModule) => void): this;
    }

    export class AkairoModule {
        constructor(id: string, exec: Function, options?: ModuleOptions);

        id: string;
        category: Category<string, AkairoModule>;
        enabled: boolean;
        filepath: string;
        client: AkairoClient;
        handler: AkairoHandler;
        
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
        handler: CommandHandler;
        commandHandler: CommandHandler;

        default(message: Message): any;
        cast(word: string, message: Message): Promise<any>;
    }

    export class Command extends AkairoModule {
        constructor(id: string, exec: Function, options?: CommandOptions);

        handler: CommandHandler;
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
        commandHandler: CommandHandler;

        trigger(message: Message): RegExp;
        condition(message: Message): boolean;
        exec(message: Message, args: Object, edited: boolean): any;
        exec(message: Message, match: string[], groups: string[] | null, edited: boolean): any;
        exec(message: Message, edited: boolean): any;
        reload(): Command;
        remove(): Command;
        parse(content: string, message?: Message): Promise<Object>;
    }

    export class CommandHandler extends AkairoHandler {
        constructor(client: AkairoClient, options: Object);

        modules: Collection<string, Command>;
        resolver: TypeResolver;
        preInhibitors: boolean;
        postInhibitors: boolean;
        handleEdits: boolean;
        cooldowns: Collection<string, Object>;
        prompts: Set<string>;
        defaultPrompt: PromptOptions;
        defaultCooldown: number;
        commands: Collection<string, Command>;

        load(filepath: string): Command;
        add(filename: string): Command;
        remove(id: string): Command;
        reload(id: string): Command;
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

        handler: InhibitorHandler;
        reason: string;
        type: string;
        inhibitorHandler: InhibitorHandler;

        exec(message: Message, command: Command): boolean | Promise<any>;
        reload(): Inhibitor;
        remove(): Inhibitor;
    }

    export class InhibitorHandler extends AkairoHandler {
        constructor(client: AkairoClient, options: Object);

        modules: Collection<string, Inhibitor>;
        inhibitors: Collection<string, Inhibitor>;

        testMessage(message: Message): Promise<void>;
        testCommand(message: Message, command: Command): Promise<void>;
        load(filepath: string): Inhibitor;
        add(filename: string): Inhibitor;
        remove(id: string): Inhibitor;
        reload(id: string): Inhibitor;

        on(event: 'add', listener: (command: Inhibitor) => void): this;
        on(event: 'remove', listener: (command: Inhibitor) => void): this;
        on(event: 'reload', listener: (command: Inhibitor) => void): this;
        on(event: 'enable', listener: (command: Inhibitor) => void): this;
        on(event: 'disable', listener: (command: Inhibitor) => void): this;
    }

    export class Listener extends AkairoModule {
        constructor(id: string, exec: Function, options?: ListenerOptions);

        handler: ListenerHandler;
        emitter: EventEmitter;
        eventName: string;
        type: string;
        listenerHandler: InhibitorHandler;

        reload(): Listener;
        remove(): Listener;
    }

    export class ListenerHandler extends AkairoHandler {
        constructor(client: AkairoClient, options: Object);

        modules: Collection<string, Listener>;
        emitters: Collection<string, EventEmitter>;
        listeners: Collection<string, Listener>;

        load(filepath: string): Listener;
        add(filename: string): Listener;
        remove(id: string): Listener;
        reload(id: string): Listener;
        register(id: string): void;
        deregister(id: string): void;

        on(event: 'add', listener: (command: Listener) => void): this;
        on(event: 'remove', listener: (command: Listener) => void): this;
        on(event: 'reload', listener: (command: Listener) => void): this;
        on(event: 'enable', listener: (command: Listener) => void): this;
        on(event: 'disable', listener: (command: Listener) => void): this;
    }

    export class Category<K, V> extends Collection<K, V> {
        constructor(id: string);

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
        prompt(message: Message, text: string, check?: RegExp | ((message: Message) => boolean), time?: number, options?: MessageOptions): Promise<Message>;
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
        preInhibitors?: boolean;
        postInhibitors?: boolean;
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
        default?: any | ((message: Message) => any);
        description?: string | string[];
        prompt?: PromptOptions;
    };

    type PromptOptions = {
        retries?: number;
        time?: number;
        cancelWord?: string;
        optional?: boolean;
        start: (message: Message) => string | string[];
        retry: (message: Message) => string | string[];
        timeout: (message: Message) => string | string[];
        ended: (message: Message) => string | string[];
        cancel: (message: Message) => string | string[];
    };

    type ArgumentType = string | string[] | ((word: string, message: Message) => any);

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
