const AkairoError = require("../../util/AkairoError");
const AkairoModule = require("../AkairoModule");
class Task extends AkairoModule {
	constructor(id, { category, delay, runOnStart } = {}) {
		super(id, { category });

		this.delay = delay;

		this.runOnStart = runOnStart;
	}

	exec() {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}
}

module.exports = Task;
