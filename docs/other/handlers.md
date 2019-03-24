# Custom Handlers

### And Custom Modules

Internally, Akairo's handlers all extends AkairoHandler, and all modules extends AkairoModule.  
So, you can create your own handlers and module types!  

Create a new class for your module.  

```js
const { AkairoModule } = require('discord-akairo');

class CustomModule extends AkairoModule {
    constructor(id, exec, options) {
        super(id, exec, options);

        this.color = options.color || 'red';
    }
}

module.exports = CustomModule;
```

Then, create a new class for your handler:  

```js
const { AkairoHandler } = require('discord-akairo');
const CustomModule = require('./CustomModule');

class CustomHandler extends AkairoHandler {
    constructor(client, options) {
        super(client, options.customDirectory, CustomModule);

        this.customOption = options.customOption || 'something';
    }
}

module.exports = CustomHandler;
```

The constructor parameters for the module should be obvious.  
For the handler, the `super()` takes the client, the directory for the handler, and the class of the module type we want to handle.  

Before we can add this handler to our client, we have to extend AkairoClient, because that's good practice.  
We want to override the `build()` method, because that is where the handlers get built.  

```js
const { AkairoClient } = require('discord-akairo');
const CustomHandler = require('./CustomHandler');

class CustomClient extends AkairoClient {
    build() {
        if (this.akairoOptions.customDirectory) {
            this.customHandler = new CustomHandler(this, this.akairoOptions);
        }

        return super.build();
    }
}

module.exports = CustomClient;
```

We first check if a directory was passed in the options, and if so, we create our handler.  
Then we call the super method, because that builds the default handlers.  
You can put the super call first if you need it in another order.  

Now, although the handler is built, we do not have the modules loaded.  
The `loadAll()` method has to be overridden now.  

```js
const { AkairoClient } = require('discord-akairo');
const CustomHandler = require('./CustomHandler');

class CustomClient extends AkairoClient {
    build() {
        if (this.akairoOptions.customDirectory) {
            this.customHandler = new CustomHandler(this, this.akairoOptions);
        }

        return super.build();
    }

    loadAll() {
        super.loadAll();
        if (this.customHandler) this.customHandler.loadAll();
    }
}

module.exports = CustomClient;
```

Note that the super method for `loadAll()` is called first, since it may be useful to have listeners ready first.  
So now, we can create our custom client, with a custom handler, with a custom module type!  

```js
const CustomClient = require('./CustomClient');

const client = new CustomClient({
    ownerID: '123992700587343872',
    prefix: '?',
    customOption: 'customized',
    commandDirectory: './commands/',
    inhibitorDirectory: './inhibitors/',
    listenerDirectory: './listeners/',
    customDirectory: './customs/'
}, {
    disableEveryone: true
});

client.login('TOKEN');
```

And the module:  

```js
const CustomModule = require('../CustomModule');

class CustomCustom extends Custom {
    constructor() {
        super('custom', {
            color: 'blue'
        });
    }

    exec() {
        console.log('I did something!');
    }
}

module.exports = CustomCustom;
```
