/*
 * Grammar:
 *
 * Arguments
 *  = (Argument (WS? Argument)*)? EOF
 *
 * Argument
 *  = Flag
 *  | Phrase
 *
 * Flag
 *  = FlagWord
 *  | OptionFlagWord WS? Phrase?
 *
 * Phrase
 *  = Quote (Word | WS)* Quote?
 *  | OpenQuote (Word | OpenQuote | Quote | WS)* EndQuote?
 *  | EndQuote
 *  | Word
 *
 * FlagWord = Given
 * OptionFlagWord = Given
 * Quote = "
 * OpenQuote = “
 * EndQuote = ”
 * Word = /^\S+/ (and not in FlagWord or OptionFlagWord)
 * WS = /^\s+/
 * EOF = /^$/
 */

/**
 * @typedef {Object} ParserOptions
 * @prop {string[]} [flagWords=[]] - Flags considered to be part of a flag arg.
 * @prop {string[]} [optionFlagWords=[]] - Flags considered to be part of an option flag arg.
 * @prop {boolean} [quoted=true] - Whether or not to consider quotes.
 * @prop {string} [content=''] - Content to parse.
 */

class Parser {
    /**
     * Parser for arguments.
     * @param {ParserOptions} options - Options for the parser.
     */
    constructor({
        flagWords = [],
        optionFlagWords = [],
        quoted = true,
        content = ''
    } = {}) {
        /**
         * Flags considered to be part of a flag arg.
         * @type {string[]}
         */
        this.flagWords = flagWords;

        /**
         * Flags considered to be part of an option flag arg.
         * @type {string[]}
         */
        this.optionFlagWords = optionFlagWords;

        /**
         * Whether or not to consider quotes.
         * @type {boolean}
         */
        this.quoted = quoted;

        /**
         * Content to parse.
         * @type {string}
         */
        this.content = content;

        /**
         * List of tokens.
         * @type {Object[]}
         */
        this.tokens = this.tokenize();

        /**
         * Position in the tokens.
         * @type {number}
         */
        this.position = 0;
    }

    /**
     * Tokenizes the content.
     * @returns {Object[]}
     */
    tokenize() {
        const tokens = [];
        let content = this.content;
        let state = 0;
        outer: while (content.length) {
            if (state === 0) {
                for (const word of this.flagWords) {
                    if (content.toLowerCase().startsWith(word.toLowerCase())) {
                        tokens.push({ t: 'FlagWord', v: content.slice(0, word.length) });
                        content = content.slice(word.length);
                        continue outer;
                    }
                }

                for (const word of this.optionFlagWords) {
                    if (content.toLowerCase().startsWith(word.toLowerCase())) {
                        tokens.push({ t: 'OptionFlagWord', v: content.slice(0, word.length) });
                        content = content.slice(word.length);
                        continue outer;
                    }
                }
            }

            if (this.quoted && content.toLowerCase().startsWith('"')) {
                if (state === 1) {
                    state = 0;
                } else if (state === 0) {
                    state = 1;
                }

                tokens.push({ t: 'Quote', v: '"' });
                content = content.slice(1);
                continue outer;
            }

            if (this.quoted && content.toLowerCase().startsWith('“')) {
                if (state === 0) {
                    state = 2;
                }

                tokens.push({ t: 'OpenQuote', v: '“' });
                content = content.slice(1);
                continue outer;
            }

            if (this.quoted && content.toLowerCase().startsWith('”')) {
                if (state === 2) {
                    state = 0;
                }

                tokens.push({ t: 'EndQuote', v: '”' });
                content = content.slice(1);
                continue outer;
            }

            const wordRe = state === 0 ? /^\S+/ : state === 1 ? /^[^\s"]+/ : /^[^\s”]+/;
            const wordMatch = content.match(wordRe);
            if (wordMatch) {
                tokens.push({ t: 'Word', v: wordMatch[0] });
                content = content.slice(wordMatch[0].length);
                continue;
            }

            const wsMatch = content.match(/^\s+/);
            if (wsMatch) {
                tokens.push({ t: 'WS', v: wsMatch[0] });
                content = content.slice(wsMatch[0].length);
                continue;
            }
        }

        tokens.push({ t: 'EOF', v: '' });
        return tokens;
    }

    /**
     * Gets the current token.
     * @type {Object}
     */
    get token() {
        return this.tokens[this.position];
    }

    /**
     * Increments position by 1.
     * @returns {void}
     */
    next() {
        this.position++;
    }

    /**
     * Matches the current token.
     * @param {string[]} types - Types of tokens to match.
     * @returns {Object}
     */
    match(types) {
        if (types.includes(this.tokens[this.position].t)) {
            this.next();
            return this.tokens[this.position - 1];
        }

        throw new Error('Parsing did not match something (this should never happen)');
    }

    /**
     * Parses the tokens into an object with representations of the original content.
     * @returns {Object}
     */
    parse() {
        const args = {
            content: [],
            phrases: [],
            flags: [],
            optionFlags: [],
            previous: 0,
            phraseAt(i) {
                return this.phrases[i] ? this.phrases[i].value : '';
            },
            flagWith(names) {
                return this.flags.find(flag => names.some(name => name.toLowerCase() === flag.key.toLowerCase()));
            },
            optionFlagWith(names) {
                return this.optionFlags.find(flag => names.some(name => name.toLowerCase() === flag.key.toLowerCase()));
            }
        };

        if (this.token.t !== 'EOF') {
            this.parseArgument(args);
            while (this.token.t !== 'EOF') {
                if (this.token.t === 'WS') {
                    const arr = args[args.previous === 0 ? 'phrases' : args.previous === 1 ? 'flags' : 'optionFlags'];
                    const ws = this.match('WS').v;
                    arr.slice(-1)[0].trailing = ws;
                    args.content[args.content.length - 1] += ws;
                }

                this.parseArgument(args);
            }
        }

        this.match('EOF');
        return args;
    }

    /**
     * Parses one argument.
     * @param {Object} args - Current representation of content.
     * @returns {void}
     */
    parseArgument(args) {
        if (['FlagWord', 'OptionFlagWord'].includes(this.token.t)) {
            this.parseFlag(args);
        } else {
            this.parsePhrase(args);
        }
    }

    /**
     * Parses one flag.
     * @param {Object} args - Current representation of content.
     * @returns {void}
     */
    parseFlag(args) {
        if (this.token.t === 'FlagWord') {
            args.previous = 1;
            const flag = { key: this.match('FlagWord').v };
            args.content.push(flag.key);
            args.flags.push(flag);
            return;
        }

        args.previous = 2;
        const flag = { key: this.match('OptionFlagWord').v };
        if (this.token.t === 'WS') flag.separation = this.match('WS').v;
        if (this.token.t === 'Word') flag.value = this.match('Word').v;
        args.content.push(`${flag.key}${flag.separation}${flag.value}`);
        args.flags.push(flag);
    }

    /**
     * Parses one phrase.
     * @param {Object} args - Current representation of content.
     * @returns {void}
     */
    parsePhrase(args) {
        args.previous = 0;
        if (this.token.t === 'Quote') {
            const phrase = {
                openQuote: this.match('Quote').v,
                items: [],
                value: ''
            };

            while (['Word', 'WS'].includes(this.token.t)) {
                const match = this.match(['Word', 'WS']);
                phrase.items.push(match.v);
                phrase.value += match.v;
            }

            if (this.token.t === 'Quote') {
                phrase.endQuote = this.match('Quote').v;
            }

            args.content.push(`${phrase.openQuote}${phrase.items.join('')}${phrase.endQuote}`);
            args.phrases.push(phrase);
            return;
        }

        if (this.token.t === 'OpenQuote') {
            const phrase = {
                openQuote: this.match('OpenQuote').v,
                items: [],
                value: ''
            };

            while (['Word', 'OpenQuote', 'Quote', 'WS'].includes(this.token.t)) {
                const match = this.match(['Word', 'OpenQuote', 'Quote', 'WS']);
                phrase.items.push(match.v);
                phrase.value += match.v;
            }

            if (this.token.t === 'EndQuote') {
                phrase.endQuote = this.match('EndQuote').v;
            }

            args.content.push(`${phrase.openQuote}${phrase.items.join('')}${phrase.endQuote}`);
            args.phrases.push(phrase);
            return;
        }

        if (this.token.t === 'EndQuote') {
            this.match('EndQuote');
            args.content.push('”');
            args.phrases.push({ value: '”' });
            return;
        }

        const phrase = { value: this.match('Word').v };
        args.content.push(phrase.value);
        args.phrases.push(phrase);
    }
}

module.exports = Parser;
