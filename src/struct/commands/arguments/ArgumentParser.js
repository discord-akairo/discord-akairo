const Argument = require('./Argument');
const { ArgumentMatches, Symbols } = require('../../../util/Constants');
const Control = require('./Control');

class ArgumentParser {
    /**
     * Parser for processing content into arguments.
     * @param {Command} command - Command to use.
     * @param {Function} parser - Content parser class to use.
     * @param {Array<ArgumentOptions|Control>} args - Argument options to use.
     */
    constructor(command, parser, args) {
        this.command = command;
        this.parser = parser;
        this.args = args;
    }

    /**
     * Parses content.
     * @param {Message} message - Message to use.
     * @param {string} content - String to parse.
     * @returns {Promise<Object>}
     */
    parse(message, content) {
        if (!this.args.length) return Promise.resolve({});

        const flags = this.getFlags();
        // eslint-disable-next-line new-cap
        const parts = new this.parser({
            flagWords: flags.flagWords,
            optionFlagWords: flags.optionFlagWords,
            quoted: this.quoted,
            content
        }).parse();

        const usedIndices = new Set();
        const parseFuncs = {
            [ArgumentMatches.PHRASE]: (arg, index) => {
                if (arg.unordered || arg.unordered === 0) {
                    return async (msg, processed) => {
                        const indices = typeof arg.unordered === 'number'
                            ? Array.from(parts.phrases.keys()).slice(arg.unordered)
                            : Array.isArray(arg.unordered)
                                ? arg.unordered
                                : Array.from(parts.phrases.keys());

                        for (const i of indices) {
                            const phrase = parts.phrases[i] ? parts.phrases[i].value : '';
                            // eslint-disable-next-line no-await-in-loop
                            const res = await arg.cast(phrase, msg, processed);
                            if (res != null) {
                                usedIndices.add(i);
                                return res;
                            }
                        }

                        return arg.process('', msg, processed);
                    };
                }

                index = arg.index == null ? index : arg.index;
                return arg.process.bind(arg, parts.phrases[index] ? parts.phrases[index].value : '');
            },
            [ArgumentMatches.REST]: (arg, index) => {
                index = arg.index == null ? index : arg.index;
                const rest = parts.phrases.slice(index, index + arg.limit).map(ph => ph.content).join('').trim();
                return arg.process.bind(arg, rest);
            },
            [ArgumentMatches.SEPARATE]: (arg, index) => {
                index = arg.index == null ? index : arg.index;
                const phrases = parts.phrases.slice(index, index + arg.limit);

                if (!phrases.length) return arg.process.bind(arg, '');
                return async (msg, processed) => {
                    const res = [];
                    processed[arg.id] = res;

                    for (const phrase of phrases) {
                        // eslint-disable-next-line no-await-in-loop
                        res.push(await arg.process(phrase.value, msg, processed));
                    }

                    return res;
                };
            },
            [ArgumentMatches.FLAG]: arg => {
                const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
                const flagFound = parts.flags.some(f => names.some(name => name.toLowerCase() === f.key.toLowerCase()));
                return () => arg.default == null ? flagFound : !flagFound;
            },
            [ArgumentMatches.OPTION]: arg => {
                const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
                const flag = parts.optionFlags.find(f => names.some(name => name.toLowerCase() === f.key.toLowerCase()));
                return arg.process.bind(arg, flag ? flag.value : '');
            },
            [ArgumentMatches.TEXT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const text = parts.phrases.slice(index, index + arg.limit).map(ph => ph.content).join('').trim();
                return arg.process.bind(arg, text);
            },
            [ArgumentMatches.CONTENT]: arg => {
                const index = arg.index == null ? 0 : arg.index;
                const text = parts.content.slice(index, index + arg.limit).join('').trim();
                return arg.process.bind(arg, text);
            },
            [ArgumentMatches.NONE]: arg => {
                return arg.process.bind(arg, '');
            }
        };

        const processed = {};
        let phraseIndex = 0;

        const process = async args => {
            if (!args.length) return processed;
            const arg = args[0];
            if (arg instanceof Control) {
                return arg.control({
                    process,
                    currentArgs: args,
                    args: this,
                    command: this.command,
                    message,
                    processedArgs: processed
                });
            }

            const matchType = typeof arg.match === 'function' ? arg.match(message, processed) : arg.match;
            const processFunc = parseFuncs[matchType](arg, phraseIndex);

            if ([ArgumentMatches.PHRASE, ArgumentMatches.REST, ArgumentMatches.SEPARATE].includes(matchType)) {
                phraseIndex++;
            }

            const res = await processFunc(message, processed);
            if (res === Symbols.COMMAND_CANCELLED) return res;
            processed[arg.id] = res;
            return process(args.slice(1));
        };

        return process(this.buildArgs(this.args));
    }

    /**
     * Gets the flags that are used in all args.
     * @returns {Object}
     */
    getFlags() {
        const res = {
            flagWords: [],
            optionFlagWords: []
        };

        (function pushFlag(arg) {
            if (Array.isArray(arg)) {
                for (const a of arg) {
                    pushFlag(a);
                }

                return;
            }

            if (arg instanceof Control) {
                pushFlag(arg.getArgs());
                return;
            }

            const arr = res[arg.match === ArgumentMatches.FLAG ? 'flagWords' : 'optionFlagWords'];
            if (arg.match === ArgumentMatches.FLAG || arg.match === ArgumentMatches.OPTION) {
                if (Array.isArray(arg.flag)) {
                    for (const p of arg.flag) {
                        arr.push(p);
                    }
                } else {
                    arr.push(arg.flag);
                }
            }
        }(this.args));

        return res;
    }

    /**
     * Builds Argument instances from argument options.
     * @param {Array<ArgumentOptions|Control>} args - Argument options to build.
     * @returns {Array<Argument|Control>}
     */
    buildArgs(args) {
        if (args == null) return [];

        const res = [];
        for (const arg of args) {
            if (arg instanceof Control) {
                res.push(arg);
                continue;
            }

            res.push(new Argument(this.command, arg));
        }

        return res;
    }
}

module.exports = ArgumentParser;
