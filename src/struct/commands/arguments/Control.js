const AkairoError = require('../../../util/AkairoError');
const { Symbols } = require('../../../util/Constants');

/**
 * Function as part of a conditional in a control.
 * @typedef {Function} ControlPredicate
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {boolean}
 */

/**
 * General function in a control.
 * @typedef {Function} ControlFunction
 * @param {Message} message - Message that triggered the command.
 * @param {Object} prevArgs - Previous arguments.
 * @returns {void}
 */

class Control {
    /**
     * Changes the control flow of the arguments parsing.
     * @param {Object} data - Data for control.
     * @returns {Object}
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    control({ process, currentArgs, command, message, processedArgs }) {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'control');
    }

    /**
     * Gets the args contained within the control.
     * @returns {Array<ArgumentOptions|Control>|ArgumentOptions|Control}
     */
    getArgs() {
        return [];
    }
}

/** @extends Control */
class IfControl extends Control {
    /**
     * Controls branching in arguments parsing.
     * @param {ControlPredicate} condition - Condition to check.
     * @param {Array<Argument|Control>|Argument|Control} trueArguments - Arguments to run if true.
     * @param {Array<Argument|Control>|Argument|Control} falseArguments - Arguments to run if false.
     */
    constructor(condition, trueArguments = [], falseArguments = []) {
        super();

        /**
         * Condition to check.
         * @type {ControlPredicate}
         */
        this.condition = condition;

        /**
         * Arguments to run if true.
         * @type {Array<Argument|Control>|Argument|Control}
         */
        this.trueArguments = trueArguments;

        /**
         * Arguments to run if false.
         * @type {Array<Argument|Control>|Argument|Control}
         */
        this.falseArguments = falseArguments;
    }

    /**
     * Branches the flow.
     * @param {Object} data - Data for control.
     * @returns {Object}
     */
    control({ process, command, message, processedArgs }) {
        return process(command.buildArgs(this.condition(message, processedArgs) ? this.trueArguments : this.falseArguments));
    }

    getArgs() {
        return Array.isArray(this.trueArguments)
            ? this.trueArguments.concat(this.falseArguments)
            : [this.trueArguments].concat(this.falseArguments);
    }
}

/** @extends Control */
class CaseControl extends Control {
    /**
     * Controls branching in arguments parsing.
     * Allows for multiple branches.
     * @param {Array<ControlPredicate|Array<Argument|Control>|Argument|Control>} condArgs - A list of conditions followed by their arguments.
     * E.g. [() => ..., [args], () => ..., [args]].
     * The last condition argument pair is considered the default case.
     */
    constructor(condArgs) {
        super();

        /**
         * A list of conditions followed by their arguments.
         * @type {Array<ControlPredicate|Array<Argument|Control>|Argument|Control>}
         */
        this.condArgs = condArgs;
    }

    /**
     * Branches the flow.
     * @param {Object} data - Data for control.
     * @returns {Object}
     */
    control({ process, command, message, processedArgs }) {
        for (let i = 0; i < this.condArgs.length; i += 2) {
            if (this.condArgs[i](message, processedArgs)) {
                return process(command.buildArgs(this.condArgs[i + 1]));
            }
        }

        return process(command.buildArgs(this.condArgs.slice(-1)[0]));
    }

    getArgs() {
        return this.condArgs.filter((v, i) => i % 2 === 1);
    }
}

/** @extends Control */
class DoControl extends Control {
    /**
     * Runs a function when the control is reached.
     * @param {ControlFunction} fn - Function to run.
     */
    constructor(fn) {
        super();

        /**
         * Function to run.
         * @type {ControlFunction}
         */
        this.fn = fn;
    }

    /**
     * Does some operation.
     * @param {Object} data - Data for control.
     * @returns {Object}
     */
    control({ process, currentArgs, command, message, processedArgs }) {
        this.fn.call(command, message, processedArgs);
        return process(currentArgs.slice(1));
    }
}

/** @extends Control */
class EndControl extends Control {
    /**
     * Ends parsing prematurely.
     */
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    /**
     * Ends parsing.
     * @param {Object} data - Data for control.
     * @returns {Object}
     */
    control({ processedArgs }) {
        return processedArgs;
    }
}

/** @extends Control */
class CancelControl extends Control {
    /**
     * Cancels the command.
     */
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    /**
     * Cancels the command.
     * @param {Object} data - Data for control.
     * @returns {Object}
     */
    control() {
        return Symbols.COMMAND_CANCELLED;
    }
}

module.exports = {
    Control,
    IfControl,
    CaseControl,
    DoControl,
    EndControl,
    CancelControl,
    if(condition, trueArguments, falseArguments) {
        return new IfControl(condition, trueArguments, falseArguments);
    },
    case(...condArgs) {
        return new CaseControl(condArgs);
    },
    do(fn) {
        return new DoControl(fn);
    },
    end() {
        return new EndControl();
    },
    cancel() {
        return new CancelControl();
    }
};
