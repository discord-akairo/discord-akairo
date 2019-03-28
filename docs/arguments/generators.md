# Generator Arguments

## Yield!

The most powerful aspect of Akairo's argument parsing is the fact that it is implemented using generators.  
With this, you can do things such as:
- Have an argument depend on the previous argument
- Branch your argument parsing
- Run an argument multiple times
- Inject code in between arguments
- And more!

To get started, take this command:  

```js
const { Command } = require('discord-akairo');

class GeneratorCommand extends Command {
    constructor() {
        super('generator', {
            aliases: ['generator']
        });
    }

    *args() {
        // Here!
    }

    exec(message, args) {
        // Do whatever.
    }
}

module.exports = GeneratorCommand;
```

Note that instead of an `args` object in the `super` call, we have a generator method, `*args`.  
We will focus on this method.  
(You can put it in the `super` call if you want, but it is cleaner this way.)  

To run an argument:  

```js
*args() {
    // Notice: no `id` necessary!
    // Also notice: `yield` must be used.
    const x = yield { type: 'integer' };
    const y = yield {
        type: 'integer',
        prompt: {
            // Everything you know still works.
        }
    };

    // When finished.
    return { x, y };
}
```

But more things are possible because you have access to all of JavaScript's syntax!  

```js
*args(message) {
    const x = yield { type: 'integer' };

    // Use previous arguments by referring to the identifier.
    const y = yield (x > 10 ? { type: 'integer' } : { type: 'string' });

    // Debug in between your arguments!
    console.log('debug', message.id, x, y);

    return { x, y };
}
```
