const AkairoError = require('../../../util/AkairoError');

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

class EndControl extends Control {
    control({ processedArgs }) {
        return processedArgs;
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

module.exports = {
    Control,
    IfControl,
    CaseControl,
    EndControl,
    TapControl,
    if(condition, trueArguments, falseArguments) {
        return new IfControl(condition, trueArguments, falseArguments);
    },
    case(...condArgs) {
        return new CaseControl(condArgs);
    },
    end() {
        return new EndControl();
    },
    tap(fn) {
        return new TapControl(fn);
    }
};
