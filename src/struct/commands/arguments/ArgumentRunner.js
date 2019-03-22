const AkairoError = require('../../../util/AkairoError');
const Argument = require('./Argument');
const { ArgumentMatches } = require('../../../util/Constants');
const Flag = require('../Flag');

class ArgumentRunner {
    constructor(command) {
        this.command = command;
    }

    get client() {
        return this.command.client;
    }

    get handler() {
        return this.command.handler;
    }

    async run(message, parsed, generator) {
        const state = {
            usedIndices: new Set(),
            phraseIndex: 0,
            index: 0
        };

        const augmentRest = val => {
            if (Flag.is(val, 'continue')) {
                val.rest = parsed.all.slice(state.index).map(x => x.raw).join('');
            }
        };

        const iter = generator(message, parsed, state);
        let curr = await iter.next();
        while (!curr.done) {
            const value = curr.value;
            if (ArgumentRunner.isShortCircuit(value)) {
                augmentRest(value);
                return value;
            }

            const res = await this.runOne(message, parsed, state, new Argument(this.command, value));
            if (ArgumentRunner.isShortCircuit(res)) {
                augmentRest(res);
                return res;
            }

            curr = await iter.next(res);
        }

        augmentRest(curr.value);
        return curr.value;
    }

    runOne(message, parsed, state, arg) {
        const cases = {
            [ArgumentMatches.PHRASE]: this.runPhrase,
            [ArgumentMatches.REST]: this.runRest,
            [ArgumentMatches.SEPARATE]: this.runSeparate,
            [ArgumentMatches.FLAG]: this.runFlag,
            [ArgumentMatches.OPTION]: this.runOption,
            [ArgumentMatches.TEXT]: this.runText,
            [ArgumentMatches.CONTENT]: this.runContent,
            [ArgumentMatches.NONE]: this.runNone
        };

        const runFn = cases[arg.match];
        if (runFn == null) {
            throw new AkairoError('UNKNOWN_MATCH_TYPE', arg.match);
        }

        return runFn.call(this, message, parsed, state, arg);
    }

    async runPhrase(message, parsed, state, arg) {
        if (arg.unordered || arg.unordered === 0) {
            const indices = typeof unordered === 'number'
                ? Array.from(parsed.phrases.keys()).slice(arg.unordered)
                : Array.isArray(arg.unordered)
                    ? arg.unordered
                    : Array.from(parsed.phrases.keys());

            for (const i of indices) {
                if (state.usedIndices.has(i)) {
                    continue;
                }

                const phrase = parsed.phrases[i] ? parsed.phrases[i].value : '';
                // `cast` is used instead of `process` since we do not want prompts.
                const res = await arg.cast(message, phrase);
                if (res != null) {
                    state.usedIndices.add(i);
                    return res;
                }
            }

            // No indices matched.
            return arg.process(message, '');
        }

        const index = arg.index == null ? state.phraseIndex : arg.index;
        const ret = arg.process(message, parsed.phrases[index] ? parsed.phrases[index].value : '');
        if (arg.index == null) {
            ArgumentRunner.increaseIndex(parsed, state);
        }

        return ret;
    }

    async runRest(message, parsed, state, arg) {
        const index = arg.index == null ? state.phraseIndex : arg.index;
        const rest = parsed.phrases.slice(index, index + arg.limit).map(x => x.raw).join('');
        const ret = await arg.process(message, rest);
        if (arg.index == null) {
            ArgumentRunner.increaseIndex(parsed, state);
        }

        return ret;
    }

    async runSeparate(message, parsed, state, arg) {
        const index = arg.index == null ? state.phraseIndex : arg.index;
        const phrases = parsed.phrases.slice(index, index + arg.limit);
        if (!phrases.length) {
            const ret = await arg.process(message, '');
            if (arg.index != null) {
                ArgumentRunner.increaseIndex(parsed, state);
            }

            return ret;
        }

        const res = [];
        for (const phrase of phrases) {
            res.push(await arg.process(message, phrase.value));
        }

        if (arg.index != null) {
            ArgumentRunner.increaseIndex(parsed, state);
        }

        return res;
    }

    runFlag(message, parsed, state, arg) {
        const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
        if (arg.multipleFlags) {
            const amount = parsed.flags.filter(flag =>
                names.some(name =>
                    name.toLowerCase() === flag.key.toLowerCase()
                )
            ).length;

            return amount;
        }

        const flagFound = parsed.flags.some(flag =>
            names.some(name =>
                name.toLowerCase() === flag.key.toLowerCase()
            )
        );

        return arg.default == null ? flagFound : !flagFound;
    }

    async runOption(message, parsed, state, arg) {
        const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
        if (arg.multipleFlags) {
            const values = parsed.optionFlags.filter(flag =>
                names.some(name =>
                    name.toLowerCase() === flag.key.toLowerCase()
                )
            ).map(x => x.value).slice(0, arg.limit);

            const res = [];
            for (const value of values) {
                res.push(await arg.process(message, value));
            }

            return res;
        }

        const foundFlag = parsed.optionFlags.find(flag =>
            names.some(name =>
                name.toLowerCase() === flag.key.toLowerCase()
            )
        );

        return arg.process(message, foundFlag != null ? foundFlag.value : '');
    }

    runText(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const text = parsed.phrases.slice(index, index + arg.limit).map(x => x.raw).join('').trim();
        return arg.process(message, text);
    }

    runContent(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const content = parsed.all.slice(index, index + arg.limit).map(x => x.raw).join('').trim();
        return arg.process(message, content);
    }

    runNone(message, parsed, state, arg) {
        return arg.process(message, '');
    }

    static increaseIndex(parsed, state, n = 1) {
        state.phraseIndex += n;
        while (n > 0) {
            do {
                state.index++;
            } while (parsed.all[state.index] && parsed.all[state.index].type !== 'Phrase');
            n--;
        }
    }

    static isShortCircuit(value) {
        return Flag.is(value, 'cancel') || Flag.is(value, 'retry') || Flag.is(value, 'continue');
    }

    static fromArguments(args) {
        return function* generate() {
            const res = {};
            for (const [id, arg] of args) {
                res[id] = yield arg;
            }

            return res;
        };
    }
}

module.exports = ArgumentRunner;
