const axios = require('axios');
const lokiDb = require('../utils/lokidb.utils');

/**
 * Fetches the player configuration from the API.
 * @returns {Promise<Object|null>} The player configuration from the API, or undefined if an error occurs.
 * @example const configAppForApi = await getConfigFromApi();
 */
async function getConfigFromApi() {
    const url = 'http://localhost:3000/player/';
    try {
        const response = await axios.get(url);

        if (response.data) {
            return response.data;
        }
        return;
    } catch (error) {
        console.error('Error geting config from api');
    }
}

/**
 * Retrieves the player configuration from the local Loki database.
 * @returns {Promise<Object|undefined>} The player configuration from the local database, or undefined if no configuration is found.
 * @example const localConfigApp = await getLocalConfig();
 */
async function getLocalConfig() {
    const db = lokiDb.newLoki();
    const config = await db.player.find();

    if (config.length > 0) {
        return config[0];
    }

    return;
}

/**
 * Retrieves the player configuration, first attempting to fetch it from the API, and falling back to a local configuration if the API call fails.
 * @returns {Promise<Object>} The player configuration object, which includes properties such as width, height, x, y, and fullscreen.
 * @example const configApp = await getConfig();
 */
async function getConfig() {
    const configAppForApi = await getConfigFromApi();

    if (configAppForApi) {
        updateConfigApp(configAppForApi);
        return configAppForApi;
    } else {
        const localConfigApp = await getLocalConfig();
        if (localConfigApp) {
            return localConfigApp;
        }

        return {
            width: 1920,
            height: 1080,
            x: 10,
            y: 10,
            fullscreen: false,
        };
    }
}

/**
 * Updates the player configuration in the local Loki database.
 * @param {Object} configForApi - The player configuration object to be updated in the database.
 * @returns {Promise<void>} A Promise that resolves when the configuration has been updated.
 * @example await updateConfigApp({
        "width": 1920,
        "height": 1080,
        "x":10,
        "y":10,
        "fullscreen": false
    });
 */
async function updateConfigApp(configForApi) {
    const db = lokiDb.newLoki();

    const config = await db.player.find();
    try {
        if (config.length > 0) {
            await db.player.update(config[0], configForApi);
        } else {
            await db.player.insert(configForApi);
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
module.exports = {
    getConfig,
};
