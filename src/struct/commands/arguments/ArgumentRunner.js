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
            phraseIndex: 0
        };

        const iter = generator();
        let curr = await iter.next();
        while (!curr.done) {
            const res = typeof curr.value === 'function'
                ? curr.value(message, parsed, state)
                : await this.runOne(message, parsed, state, new Argument(this.command, curr.value));

            if (res instanceof Flag) {
                return res;
            }

            curr = await iter.next(res);
        }

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
            // TODO: Make into AkairoError.
            throw new TypeError('Unknown match type');
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

                const phrase = parsed.phrases[i] || '';
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
        const ret = arg.process(message, parsed.phrases[index] || '');
        if (arg.index == null) {
            state.phraseIndex++;
        }

        return ret;
    }

    async runRest(message, parsed, state, arg) {
        const index = arg.index == null ? state.phraseIndex : arg.index;
        const rest = parsed.phrases.slice(index, index + arg.limit).join(' ');
        const ret = await arg.process(message, rest);
        if (arg.index == null) {
            state.phraseIndex++;
        }

        return ret;
    }

    async runSeparate(message, parsed, state, arg) {
        const index = arg.index == null ? state.phraseIndex : arg.index;
        const phrases = parsed.phrases.slice(index, index + arg.limit);
        if (!phrases.length) {
            const ret = await arg.process(message, '');
            if (arg.index != null) {
                state.phraseIndex++;
            }

            return ret;
        }

        const res = [];
        for (const phrase of phrases) {
            res.push(await arg.process(message, phrase));
        }

        if (arg.index != null) {
            state.phraseIndex++;
        }

        return res;
    }

    runFlag(message, parsed, state, arg) {
        const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
        const flagFound = parsed.flags.some(flag =>
            names.some(name =>
                name.toLowerCase() === flag.toLowerCase()
            )
        );

        return arg.default == null ? flagFound : !flagFound;
    }

    async runOption(message, parsed, state, arg) {
        const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
        if (arg.multipleFlags) {
            const values = parsed.optionFlags.filter(([flag]) =>
                names.some(name =>
                    name.toLowerCase() === flag.toLowerCase()
                )
            ).map(([, value]) => value);

            const res = [];
            for (const value of values) {
                res.push(await arg.process(message, value));
            }

            return res;
        }

        const [, value] = parsed.optionFlags.find(([flag]) =>
            names.some(name =>
                name.toLowerCase() === flag.toLowerCase()
            )
        );

        return arg.process(message, value);
    }

    runText(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const text = parsed.raws.slice(index, index + arg.limit).join('').trim();
        return arg.process(message, text);
    }

    runContent(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const content = parsed.phrases.slice(index, index + arg.limit).join(' ').trim();
        return arg.process(message, content);
    }

    runNone(message, parsed, state, arg) {
        return arg.process(message, '');
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
