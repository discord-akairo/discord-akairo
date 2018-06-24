const AkairoError = require('../../../util/AkairoError');
const { Symbols } = require('../../../util/Constants');

class Control {
    // eslint-disable-next-line no-unused-vars
    control({ process, currentArgs, command, message, processedArgs }) {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'run');
    }
}

class IfControl extends Control {
    constructor(condition, trueArguments = [], falseArguments = []) {
        super();

        this.condition = condition;
        this.trueArguments = trueArguments;
        this.falseArguments = falseArguments;
    }

    control({ process, command, message, processedArgs }) {
        return process(command.buildArgs(this.condition(message, processedArgs) ? this.trueArguments : this.falseArguments));
    }
}

class CaseControl extends Control {
    constructor(condArgs) {
        super();

        this.condArgs = condArgs;
    }

    control({ process, command, message, processedArgs }) {
        for (let i = 0; i < this.condArgs.length; i += 2) {
            if (this.condArgs[i](message, processedArgs)) {
                return process(command.buildArgs(this.condArgs[i + 1]));
            }
        }

        return process(command.buildArgs(this.condArgs.slice(-1)[0]));
    }
}

class TapControl extends Control {
    constructor(fn) {
        super();

        this.fn = fn;
    }

    control({ process, currentArgs, command, message, processedArgs }) {
        this.fn.call(command, message, processedArgs);
        return process(currentArgs.slice(1));
    }
}

class EndControl extends Control {
    control({ processedArgs }) {
        return processedArgs;
    }
}

class CancelControl extends Control {
    control() {
        return Symbols.COMMAND_CANCELLED;
    }
}

module.exports = {
    Control,
    IfControl,
    CaseControl,
    TapControl,
    EndControl,
    CancelControl,
    if(condition, trueArguments, falseArguments) {
        return new IfControl(condition, trueArguments, falseArguments);
    },
    case(...condArgs) {
        return new CaseControl(condArgs);
    },
    tap(fn) {
        return new TapControl(fn);
    },
    end() {
        return new EndControl();
    },
    cancel() {
        return new CancelControl();
    }
};
