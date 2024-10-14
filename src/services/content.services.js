const fs = require('fs');
const os = require('os');
const axios = require('axios');
const moment = require('moment');
const lokiDb = require('../utils/lokidb.utils');
const downloader = require('../utils/downloader.utils');

/**
 * Synchronize the contents of the local database and files with those provided by the API
 *
 * @returns {Promise<boolean>} A promise that resolves to true or false when the local content database and files have been synchronized.
 * @example
 * await updateLocalContents();
 */
async function updateLocalContents() {
    const newContents = await getContentFromApi();

    await syncLocalContentDb(newContents);
    await syncLocalContentFiles(newContents);

    return true;
}

/**
 * Fetches content data from an API endpoint and returns the response data.
 *
 * @returns {Promise<Array<Object>>} An array of content objects from the API response.
 * @throws {Error} If there is an error fetching the content from the API.
 * @example newContentsForApi = await getContentFromApi();
 */
async function getContentFromApi() {
    const url = 'http://localhost:3000/content/';
    try {
        const response = await axios.get(url);

        if (response.data.length > 0) {
            return response.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error geting content from api:');
        return [];
    }
}

/**
 * Updates the local content database with the new content data.
 *
 * @param {Array<Object>} newContents - An array of new content objects.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the synchronization was successful, or `false` otherwise.
 * @example await syncLocalContentDb([{
        "type": "video",
        "url": "https://example.com/content1.mp4",
        "length": 2,
        "position": 1,
        "fill_screen": false,
        "from_date": "2024-10-12 00:00:00",
        "to_date": "2024-10-20 23:00:00",
        "updated_at": "2024-10-12 04:08:00"
    }
    ]);
 */
async function syncLocalContentDb(newContents = []) {
    try {
        const db = lokiDb.newLoki();
        for (const newContent of newContents) {
            if (newContent.type !== 'url') {
                newContent.download = false;
                newContent.localPath = '';
            }

            const contentInDb = await db.content.findOne({
                url: newContent.url,
            });

            if (contentInDb) {
                const dateContenInDb = moment(
                    contentInDb.updated_at,
                    'YYYY-MM-DD HH:mm:ss'
                );
                const newDateContent = moment(
                    newContent.updated_at,
                    'YYYY-MM-DD HH:mm:ss'
                );

                if (newDateContent.isAfter(dateContenInDb)) {
                    contentInDb.type = newContent.type;
                    contentInDb.url = newContent.url;
                    contentInDb.length = newContent.length;
                    contentInDb.position = newContent.position;
                    contentInDb.fill_screen = newContent.fill_screen;
                    contentInDb.from_date = newContent.from_date;
                    contentInDb.to_date = newContent.to_date;
                    contentInDb.updated_at = newContent.updated_at;

                    await db.content.update(contentInDb);
                }
            } else {
                db.content.insert(newContent);
            }
        }

        const contentInDb = await db.content.find();

        let contentDeleted = contentInDb.filter(
            (content) =>
                !newContents.find(
                    (newContent) => newContent.url === content.url
                )
        );

        if (contentDeleted.length > 0) {
            await db.content.remove(contentDeleted);
        }

        return true;
    } catch (error) {
        console.error('Error syncing local content db:', error);
    }

    return true;
}

/**
 * Checks the local content files and updates the download status for each new content item. It also removes any unnecessary local content files that are not part of the new content.
 * 
 * @param {Array<Object>} newContents - An array of new content objects, each with a `url` property.
 * @returns {boolean} - Returns `true` if the synchronization was successful, `false` otherwise.
 * @example await syncLocalContentFiles([{
        "type": "video",
        "url": "https://example.com/content1.mp4",
        "length": 2,
        "position": 1,
        "fill_screen": false,
        "from_date": "2024-10-12 00:00:00",
        "to_date": "2024-10-20 23:00:00",
        "updated_at": "2024-10-12 04:08:00"
    }
    ]);
 */
async function syncLocalContentFiles(newContents = []) {
    const localContentFiles = fs.readdirSync(`${os.tmpdir()}/player/content/`);

    newContents.forEach((newContent) => {
        if (newContent.type !== 'url') {
            if (localContentFiles.includes(newContent.url.split('/').pop())) {
                downloader.updateDownloadStatus(newContent.url, 'downloaded');
            } else {
                downloader.addToQueue(newContent.url);
            }
        }
    });

    const unnecessaryFiles = localContentFiles.filter(
        (localContentFile) =>
            !newContents.find(
                (newContent) =>
                    newContent.url.split('/').pop() === localContentFile
            )
    );

    if (unnecessaryFiles.length > 0) {
        unnecessaryFiles.forEach((file) => {
            fs.unlinkSync(`${os.tmpdir()}/player/content/${file}`);
        });
    }

    return true;
}

/**
 * Retrieves content that is available to play and is currently within the valid date range.
 *
 * @returns {Promise<Array<Object>>} - An array of content objects that are available and currently within the valid date range, sorted by position.
 * @example const contentDownloaded = await getContentDowloaded();
 */
async function getContentDowloaded() {
    const db = lokiDb.newLoki();
    let contentDownloaded = await db.content.find({
        $or: [{ download: 'downloaded' }, { type: 'url' }],
    });

    const currentDate = new Date();

    contentDownloaded = contentDownloaded.filter((content) => {
        const fromDate = new Date(content.from_date);
        const toDate = new Date(content.to_date);

        return currentDate >= fromDate && currentDate <= toDate;
    });

    contentDownloaded.sort((a, b) => a.position - b.position);

    return contentDownloaded;
}

module.exports = {
    getContentDowloaded,
    updateLocalContents,
};
