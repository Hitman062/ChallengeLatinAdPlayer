const loki = require('lokijs');
const os = require('os');

/**
 * Initializes the global NeDB database instance if it doesn't already exist.
 */
const init = async () => {
    return new Promise((resolve, reject) => {
        const db = new loki(`${os.tmpdir()}/player/player.json`, {
            autosave: true,
            autosaveInterval: 4000,
            autoload: true,
            autoloadCallback: () => {
                try {
                    let content = db.getCollection('content');
                    let playerConfig = db.getCollection('playerConfig');

                    if (!content) {
                        content = db.addCollection('content');
                    }
                    if (!playerConfig) {
                        playerConfig = db.addCollection('playerConfig');
                    }

                    global.content = content;
                    global.player = playerConfig;

                    resolve(global);
                } catch (error) {
                    reject(error);
                }
            },
        });
    });
};

/**
 * Returns the global NeDB database instance, or creates a new one if it doesn't exist.
 * @returns {Datastore} The NeDB database instance.
 */
const newLoki = () => {
    return global || init();
};

module.exports = {
    init,
    newLoki,
};
