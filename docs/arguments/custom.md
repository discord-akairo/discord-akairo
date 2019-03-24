# Custom Types

### Manual Build

We want to access the client's TypeResolver in order to add new types for our arguments.  
However, it does not exist normally until after you call `login()`.  
Since it would be easier to add types before login, we should build the client early.  
This is done with `client.build()`.  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/'
}, {
    disableEveryone: true
});

// We have access to the handlers, and therefore the type resolver, before login now!
client.build();
client.login('TOKEN');
```

Now to add a new type:  

```js
const { AkairoClient } = require('discord-akairo');

const client = new AkairoClient({
    ownerID: '123992700587343872',
    prefix: '?',
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/'
}, {
    disableEveryone: true
});

client.build();

const pokemonList = require('./pokemon.json');
client.commandHandler.resolver.addType('pokemon', word => {
    if (!word) return null;

    for (const pokemon of pokemonList) {
        if (pokemon.name.toLowerCase() === word.toLowerCase()) {
            return pokemon;
        }
    }

    return null;
});

client.login('TOKEN');
```

We now have a new type called `pokemon` which we can use in a command!  
Simply do `type: 'pokemon'` for an argument and everything will work as expected.  

### With Message

Let's say we want to add a type that would get a role based on the input.  
This means we need access to the guild through the message.  
Good thing the second parameter is the message!  

```js
client.commandHandler.resolver.addType('colorRole', (word, message) => {
    if (!word) return null;

    const roles = {
        red: '225939226628194304',
        blue: '225939219841810432',
        green: '225939232512802816'
    };

    const role = message.guild.roles.get(roles[word.toLowerCase()]);
    return role || null;
});
```

So now, using the type `colorRole`, we can get either red, blue, or green from the input and end up with corresponding role object!  

### Accessing Another Type

To get another type for use, you use the `type` method on TypeResolver.  
The following gives the `member` type and we can use as part of another type.  

```js
client.commandHandler.resolver.addType('moderator', (word, message) => {
    if (!word) return null;
    const memberType = client.commandHandler.resolver.type('member');
    const member = memberType(word, message);
    if (!member.roles.has('222089067028807682')) return null;
    return member;
});
```
