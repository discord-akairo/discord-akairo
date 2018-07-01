const AkairoError = require('../../../util/AkairoError');
const InternalFlag = require('../InternalFlag');

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
     * A control for argument parsing.
     */
    // eslint-disable-next-line no-useless-constructor, no-empty-function
    constructor() {}

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
     * Gets the argument options contained within the control.
     * @returns {Array<ArgumentOptions|Control>}
     */
    getArgs() {
        return [];
    }

    /**
     * Creates a control for branching in arguments parsing.
     * @param {ControlPredicate} condition - Condition to check.
     * @param {Array<ArgumentOptions|Control>} [trueArguments=[]] - Arguments to run if true.
     * @param {Array<ArgumentOptions|Control>} [falseArguments=[]] - Arguments to run if false.
     * @returns {IfControl}
     */
    static if(condition, trueArguments = [], falseArguments = []) {
        return new IfControl(condition, trueArguments, falseArguments);
    }

    /**
     * Creates a control for branching in arguments parsing.
     * Allows for multiple branches.
     * @param {Array<ControlPredicate|Array<ArgumentOptions|Control>>} condArgs - A list of conditions followed by their arguments.
     * E.g. [() => ..., [args], () => ..., [args]].
     * @returns {CaseControl}
     */
    static case(...condArgs) {
        return new CaseControl(condArgs);
    }

    /**
     * Creates a control that runs a function when the control is reached.
     * @param {ControlFunction} fn - Function to run.
     * @returns {DoControl}
     */
    static do(fn) {
        return new DoControl(fn);
    }

    /**
     * Creates a control that ends parsing prematurely.
     * @returns {EndControl}
     */
    static end() {
        return new EndControl();
    }

    /**
     * Creates a control that cancels the command.
     * @returns {CancelControl}
     */
    static cancel() {
        return new CancelControl();
    }
}

/** @extends Control */
class IfControl extends Control {
    /**
     * Controls branching in arguments parsing.
     * @param {ControlPredicate} condition - Condition to check.
     * @param {Array<ArgumentOptions|Control>} [trueArguments=[]] - Arguments to run if true.
     * @param {Array<ArgumentOptions|Control>} [falseArguments=[]] - Arguments to run if false.
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
         * @type {Array<ArgumentOptions|Control>}
         */
        this.trueArguments = trueArguments;

        /**
         * Arguments to run if false.
         * @type {Array<ArgumentOptions|Control>}
         */
        this.falseArguments = falseArguments;
    }

    /**
     * Branches the flow.
     * @param {Object} data - Data for control.
     * @returns {Object}
     */
    control({ process, currentArgs, args, message, processedArgs }) {
        const branch = (this.condition(message, processedArgs) ? this.trueArguments : this.falseArguments).concat(currentArgs.slice(1));
        return process(args.buildArgs(branch));
    }

    getArgs() {
        return this.trueArguments.concat(this.falseArguments);
    }
}

/** @extends Control */
class CaseControl extends Control {
    /**
     * Controls branching in arguments parsing.
     * Allows for multiple branches.
     * @param {Array<ControlPredicate|Array<ArgumentOptions|Control>>} condArgs - A list of conditions followed by their arguments.
     * E.g. [() => ..., [args], () => ..., [args]].
     */
    constructor(condArgs) {
        super();

        /**
         * A list of conditions followed by their arguments.
         * @type {Array<ControlPredicate|Array<ArgumentOptions|Control>>}
         */
        this.condArgs = condArgs;
    }

    /**
     * Branches the flow.
     * @param {Object} data - Data for control.
     * @returns {Object}
     */
    control({ process, currentArgs, args, message, processedArgs }) {
        for (let i = 0; i < this.condArgs.length; i += 2) {
            if (this.condArgs[i](message, processedArgs)) {
                return process(args.buildArgs(this.condArgs[i + 1].concat(currentArgs.slice(1))));
            }
        }

        return process(args.buildArgs(currentArgs.slice(1)));
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
    control({ process, currentArgs, args, command, message, processedArgs }) {
        this.fn.call(command, message, processedArgs);
        return process(args.buildArgs(currentArgs.slice(1)));
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
        return InternalFlag.cancel();
    }
}

Object.assign(Control, {
    IfControl,
    CaseControl,
    DoControl,
    EndControl,
    CancelControl
});

module.exports = Control;
