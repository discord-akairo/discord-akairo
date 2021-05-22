# Changes in this fork of akairo

## Slash commands
For slash commands to work you need to add `execSlash` to the command, and when it recieves a slash command it will run `execSlash`.

New slash command related events:
 * slashError
 * slashBlocked
    * owner
    * superuser
 * slashStarted
 * slashNotFound
 * slashGuildOnly
 * slashMissingPermissions
    * user
    * client

For more info about these events view the [source code](https://github.com/SkyBlockDev/discord-akairo/blob/master/src/struct/commands/CommandHandler.js#L396). If you don't want to do that, you can safely assume that they are the exact same as their non-slash versions, execpt all `Message` arguments are changed to `CommandInteraction`.

Slash command example:
```ts
import { Command } from "discord-akairo";
import { CommandInteraction, CommandInteractionOption, Message, User } from "discord.js";
export default class AvatarCommand extends Command {
    public constructor() {
        super("avatar", {
            aliases: ["avatar"]
        });
    }
    exec(message: Message) {
        message.reply("This also works")
    }
    async execSlash(interaction: CommandInteraction, { user }: { user?: CommandInteractionOption } ) {
        const member = user?.user ?? interaction.user;
        return interaction.reply(
            this.client.util
                .embed()
                .setTitle(`${member.username}'s Avatar`)
                .setURL(member.displayAvatarURL({ format: "png", size: 512, dynamic: true }))
                .setColor(this.client.colors.green)
                .setImage(member.displayAvatarURL({ format: "png", size: 512, dynamic: true }))
        );
    }
}
```
Note that this example assumes a few things.
1. You already have a registered slash command called `avatar`
2. The registered command has one option named `user`, and
    1. The type is `6` (enum value for user)
    2. Required is `false`

You can do this all manually using something like an eval command, or just making the http requests to the discord api yourself, or making it automated, but just keep in mind that the library won't register anything for you. Read [this](https://github.com/MatteZ02/discord-interactions) for how to create/edit/delete slash commands in discord.js.

## Tasks

Yes this fork has tasks!

example: 


```ts
//bot.ts
import {TaskHandler} from "discord-akairo"
....
taskHandler: TaskHandler = new TaskHandler(this, {
	directory: join(__dirname, "..", "tasks"),
});
....
this.taskHandler.loadAll();
this.taskHandler.startAll();
...
```

```ts
//tasks/task.ts
import {Task} from "discord-akairo";
export default class extends Task {
	constructor() {
		super("hello", {
			delay: 200,
			runOnStart: false,
		});
	}
	async exec() {
		console.log("hello from", this.client.user.username)
	}
}
````


## Superusers

SuperUsers example: 
```ts
constructor(config: Option) {
		super({
			ownerID: config.owners,
			superUserID: config.superUsers,
		});
	}
```
```ts
constructor(config: Option) {
		super({
			ownerID: config.owners,
            //Owners arent automatically added as superuser
			superUserID: [...config.owners,...config.superUsers],
		});
	}
```

## Auto defer
Auto defer automatically defers a message aka "BotName is thinking"

```ts
commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, "..", "Commands"),
		prefix: "!",
        //To disable it
        autoDefer: false
	});
```
