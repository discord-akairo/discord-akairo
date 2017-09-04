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
}

module.exports = Util;
