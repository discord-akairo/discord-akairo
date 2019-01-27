class Util {
    static isPromise(value) {
        return value
        && typeof value.then === 'function'
        && typeof value.catch === 'function';
    }

    static isEventEmitter(value) {
        return value
        && typeof value.on === 'function'
        && typeof value.emit === 'function';
    }

    static prefixCompare(aKey, bKey) {
        if (aKey === '' && bKey === '') return 0;
        if (aKey === '') return 1;
        if (bKey === '') return -1;
        if (typeof aKey === 'function' && typeof bKey === 'function') return 0;
        if (typeof aKey === 'function') return 1;
        if (typeof bKey === 'function') return -1;
        return aKey.length === bKey.length
            ? aKey.localeCompare(bKey)
            : bKey.length - aKey.length;
    }

    static intoArray(x) {
        if (Array.isArray(x)) {
            return x;
        }

        return [x];
    }

    static intoCallable(thing) {
        if (typeof thing === 'function') {
            return thing;
        }

        return () => thing;
    }

    static flatMap(xs, f) {
        const res = [];
        for (const x of xs) {
            res.push(...f(x));
        }

        return res;
    }
}

module.exports = Util;
