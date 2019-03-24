# Previous Arguments

### Changing Types and Prompts

Let's say we want to have an argument that changes its type or prompts depending on a previous argument.  
This is made possible in Akairo because the previous arguments are passed!  

When using a function for `type`, they are passed in the third parameter.  
When using a function for prompts, they are passed in the second parameter.  

Let's make a sub-command, that is, a command that changes depending on an argument.  
For example, let's say we have the command `?findpokemon`.  
Then, our first argument would be either `name` or `id`, to find a Pokemon using one of the method.  
So, if the command is `?findpokemon name`, the second argument must be a string.  
However, if it is `?findpokemon id`, the second argument must be an integer.  

In order to do this, we check the previous argument, `option`, in our second argument's type and prompt functions.  

```js
const { Command } = require('discord.js');
const examplePokemonAPI = require('example-pokemon')

class FindPokemonCommand extends Command {
    constructor() {
        super('findpokemon', {
            aliases: ['findpokemon'],
            args: [
                {
                    id: 'option',
                    type: ['name', 'id'],
                    prompt: {
                        start: 'Would you like to find by name or by ID?',
                        retry: 'Type `name` or `id`, please!'
                    }
                },
                {
                    id: 'query',
                    type: (word, message, args) => {
                        if (!word) return null;

                        // args.option refers to the previous argument.
                        if (args.option === 'name') {
                            return word;
                        }

                        if (args.option === 'id') {
                            if (isNaN(word)) return null;
                            const num = parseInt(word);
                            return num;
                        }
                    },
                    prompt: {
                        start: (message, args) => {
                            // Either 'name' or 'id'.
                            return `${message.author}, What is the ${args.option} of the Pokemon?`;
                        },
                        retry: (message, args) => {
                            if (args.option === 'name') {
                                return `${message.author}, Please input a name!`;
                            }

                            if (args.option === 'id') {
                                return `${message.author}, Please input an integer ID!`;
                            }
                        }
                    }
                }
            ]
        });
    }

    exec(message, args) {
        if (args.option === 'name') {
            const pokemon = examplePokemonAPI.findByName(args.query);
            return message.reply(pokemon.name);
        }

        if (args.option === 'id') {
            const pokemon = examplePokemonAPI.findByID(args.query);
            return message.reply(pokemon.name);
        }
    }
}

module.exports = FindPokemonCommand;
```

As seen in the `type` function and the prompt functions, the previous argument `option` can be accessed.  
Then, we simply change the behavior based on what it was.  
