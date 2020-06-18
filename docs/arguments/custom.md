# Custom Types

### New Type

We have to access the command handler's `TypeResolver` in order to add new types for our arguments.  
To add a new type:  

```js
this.commandHandler = new CommandHandler(this, { /* Options here */ });
this.commandHandler.resolver.addType('pokemon', (message, phrase) => {
    if (!phrase) return null;

    for (const pokemon of pokemonList) {
        if (pokemon.name.toLowerCase() === phrase.toLowerCase()) {
            return pokemon;
        }
    }

    return null;
});
```

We now have a new type called `pokemon` which we can use in a command!  
Simply do `type: 'pokemon'` for an argument and everything will work as expected.  

### With Message

Let's say we want to add a type that would get a role based on the input.  
This means we need access to the guild through the message.  
Good thing the first parameter is the message!  

```js
this.commandHandler.resolver.addType('colorRole', (message, phrase) => {
    if (!phrase) return null;

    const roles = {
        red: '225939226628194304',
        blue: '225939219841810432',
        green: '225939232512802816'
    };

    const role = message.guild.roles.cache.get(roles[phrase.toLowerCase()]);
    return role || null;
});
```

So now, using the type `colorRole`, we can get either red, blue, or green from the input and end up with corresponding role object!  

### Accessing Another Type

To get another type for use, you use the `type` method on `TypeResolver`.  
The following gives the `member` type and we can use as part of another type.  

```js
this.commandHandler.resolver.addType('moderator', (message, phrase) => {
    if (!phrase) return null;
    const memberType = this.commandHandler.resolver.type('member');
    const member = memberType(message, phrase);
    if (!member.roles.cache.has('222089067028807682')) return null;
    return member;
});
```
