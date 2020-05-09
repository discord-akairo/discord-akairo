const { Types } = require('../../');
const integer = Types.number({ type: 'integer' });

const isPrime = num => {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
        if (num % i === 0) return false;
    }
    return num > 1;
};

module.exports = {
    primeNumber: () => (message, phrase) => {
        if (!phrase) return null;
        const num = integer(message, phrase);
        return isPrime(num) ? num : null;
    }
};
