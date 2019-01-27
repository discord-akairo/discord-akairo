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
}

module.exports = Util;
