const { Duration } = require('@klasa/duration');

class TimeFormatter {
    static date(arg) {
        const date = new Date(arg);
        if (!Number.isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
        throw new Error('fail');
    }

    static duration(arg) {
        const date = new Duration(arg).fromNow;
        if (!Number.isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
        throw new Error('fail');
    }

    static async run(arg) {
        let date;
        try {
            date = await TimeFormatter.date(arg);
        } catch (e) {
            try {
                date = await TimeFormatter.duration(arg);
            } catch (err) {
                //
            }

            if (date && !Number.isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
            return false;
        }
        return false;
    }
}

module.exports = TimeFormatter;
