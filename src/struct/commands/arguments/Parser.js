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
 *  | PrefixFlagWord WS? Phrase?
 *
 * Phrase
 *  = Quote (Word | WS)* Quote?
 *  | Word
 *
 * FlagWord = Given
 * PrefixFlagWord = Given
 * Quote = Given (default ")
 * Word = /^\S+/ (and not in FlagWord or PrefixFlagWord)
 * WS = /^\s+/
 * EOF = /^$/
 */

class ArgumentsParser {
    constructor({
        flagWords = [],
        prefixFlagWords = [],
        quotes = ['"'],
        content = ''
    } = {}) {
        this.flagWords = flagWords;
        this.prefixFlagWords = prefixFlagWords;
        this.quotes = quotes;
        this.content = content;
        this.tokens = this.tokenize();
        this.position = 0;
    }

    tokenize() {
        const tokens = [];
        let content = this.content;
        let stringState = false;
        outer: while (content.length) {
            if (!stringState) {
                for (const word of this.flagWords) {
                    if (content.toLowerCase().startsWith(word.toLowerCase())) {
                        tokens.push({ t: 'FlagWord', v: content.slice(0, word.length) });
                        content = content.slice(word.length);
                        continue outer;
                    }
                }

                for (const word of this.prefixFlagWords) {
                    if (content.toLowerCase().startsWith(word.toLowerCase())) {
                        tokens.push({ t: 'PrefixFlagWord', v: content.slice(0, word.length) });
                        content = content.slice(word.length);
                        continue outer;
                    }
                }
            }

            for (const quote of this.quotes) {
                if (content.toLowerCase().startsWith(quote.toLowerCase())) {
                    stringState = !stringState;
                    tokens.push({ t: 'Quote', v: content.slice(0, quote.length) });
                    content = content.slice(quote.length);
                    continue outer;
                }
            }

            const wordMatch = content.match(/^\S+/);
            if (wordMatch) {
                const cutoff = Math.min(...this.quotes.map(q => wordMatch[0].indexOf(q)));
                if (cutoff >= 0) wordMatch[0] = wordMatch[0].slice(0, cutoff);
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

    get token() {
        return this.tokens[this.position];
    }

    next() {
        this.position++;
    }

    match(types) {
        if (types.includes(this.tokens[this.position].t)) {
            this.next();
            return this.tokens[this.position - 1];
        }

        throw new Error('Parsing did not match something (this should never happen)');
    }

    parse() {
        const args = {
            content: [],
            phrases: [],
            flags: [],
            prefixFlags: [],
            previous: 0,
            phraseAt(i) {
                return this.phrases[i] ? this.phrases[i].value : '';
            },
            flagWith(names) {
                return this.flags.find(flag => names.some(name => name.toLowerCase() === flag.key.toLowerCase()));
            },
            prefixFlagWith(names) {
                return this.prefixFlags.find(flag => names.some(name => name.toLowerCase() === flag.key.toLowerCase()));
            }
        };

        if (this.token.t !== 'EOF') {
            this.parseArgument(args);
            while (this.token.t !== 'EOF') {
                if (this.token.t === 'WS') {
                    const arr = args[args.previous === 0 ? 'phrases' : args.previous === 1 ? 'flags' : 'prefixFlags'];
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

    parseArgument(args) {
        if (['FlagWord', 'PrefixFlagWord'].includes(this.token.t)) {
            this.parseFlag(args);
        } else {
            this.parsePhrase(args);
        }
    }

    parseFlag(args) {
        if (this.token.t === 'FlagWord') {
            args.previous = 1;
            const flag = { key: this.match('FlagWord').v };
            args.content.push(flag.key);
            args.flags.push(flag);
            return;
        }

        args.previous = 2;
        const flag = { key: this.match('PrefixFlagWord').v };
        if (this.token.t === 'WS') flag.separation = this.match('WS').v;
        if (this.token.t === 'Word') flag.value = this.match('Word').v;
        args.content.push(`${flag.key}${flag.separation}${flag.value}`);
        args.flags.push(flag);
    }

    parsePhrase(args) {
        args.previous = 0;
        if (this.token.t === 'Quote') {
            const phrase = {
                openQuote: this.match('Quote'),
                items: [],
                value: ''
            };

            while (['Word', 'WS'].includes(this.token.t)) {
                const match = this.match(['Word', 'WS']);
                phrase.items.push(match.v);
                phrase.value += match.v;
            }

            if (this.token.t === 'Quote') {
                phrase.endQuote = this.match('Quote');
            }

            args.content.push(`${phrase.openQuote}${phrase.items.join('')}${phrase.endQuote}`);
            args.phrases.push(phrase);
            return;
        }

        const phrase = { value: this.match('Word').v };
        args.content.push(phrase.value);
        args.phrases.push(phrase);
    }
}

module.exports = ArgumentsParser;
