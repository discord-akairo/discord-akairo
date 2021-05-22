const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const Task = require('./Task');
class TaskHandler extends AkairoHandler {
    constructor(
        client,
        {
            directory,
            classToHandle = Task,
            extensions = ['.js', '.ts'],
            automateCategories,
            loadFilter
        } = {}
    ) {
        if (!(classToHandle.prototype instanceof Task || classToHandle === Task)) {
            throw new AkairoError(
                'INVALID_CLASS_TO_HANDLE',
                classToHandle.name,
                Task.name
            );
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });
    }

    startAll() {
        this.client.on('ready', () => {
            this.modules.forEach(task => {
                if (task.runOnStart) task.exec(this.client);
                if (task.delay) {
                    setInterval(() => {
                        task.exec(this.client);
                    }, Number(task.delay));
                }
            });
        });
    }
}
module.exports = TaskHandler;
