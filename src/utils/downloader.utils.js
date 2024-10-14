const fs = require('fs');
const os = require('os');
const axios = require('axios');
const lokiDb = require('../utils/lokidb.utils');

const possibleStates = ['downloaded', 'downloading', 'not downloaded'];

let isDownloading = false;
let downloadQueue = [];

/**
 * Adds a content URL to the download queue and starts the download process if it's not already running.
 *
 * @param {string} contentUrl - The URL of the content to be downloaded.
 * @example addToQueue('https://example.com/content1.mp4')
 */
function addToQueue(contentUrl) {
    if (!(contentUrl in downloadQueue)) {
        downloadQueue.push(contentUrl);
    }
    if (!isDownloading) {
        processQueue();
    }
}

/**
 * Adds an array of content URLs to the download queue and starts the download process if it's not already running.
 *
 * @param {string[]} contentsUrl - An array of content URLs to be added to the download queue.
 * @example addArrayToQueue(['https://example.com/content1.mp4', 'https://example.com/content2.mp4'])
 */
function addArrayToQueue(contentsUrl) {
    contentsUrl.forEach((contentUrl) => {
        addToQueue(contentUrl);
    });
}

/**
 * Processes the download queue by downloading each content URL in the queue and updating the download status in the database.
 *
 * This function is responsible for the following steps:
 * 1. Checks if the download queue is empty, and returns if it is.
 * 2. Sets the `isDownloading` flag to `true` to indicate that the download process is running.
 * 3. Iterates through the download queue, processing each content URL:
 *    a. Updates the download status in the database to 'downloading'.
 *    b. Downloads the content file using the `downloadFile` function.
 *    c. Updates the download status in the database to 'downloaded'.
 * 4. Sets the `isDownloading` flag to `false` to indicate that the download process has completed.
 */
async function processQueue() {
    if (downloadQueue.length === 0) {
        return;
    }

    isDownloading = true;

    while (downloadQueue.length > 0) {
        const contentUrl = downloadQueue.shift();

        await updateDownloadStatus(contentUrl, 'downloading');
        await downloadFile(contentUrl);
        await updateDownloadStatus(contentUrl, 'downloaded');
    }

    isDownloading = false;
}

/**
 * Downloads a file from the specified URL and saves it to a temporary location on the file system.
 *
 * @param {string} url - The URL of the file to be downloaded.
 * @returns {Promise<void>} - A Promise that resolves when the file download is complete, or rejects if an error occurs.
 * @example downloadFile('https://example.com/content.mp4')
 */
async function downloadFile(url) {
    const localPath = `${os.tmpdir()}/player/content/${url.split('/').pop()}`;
    const writer = fs.createWriteStream(localPath);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error descargando el video:', error);
    }
}

/**
 * Updates the download status of a content item in the database.
 *
 * @param {string} contentUrl - The URL of the content item.
 * @param {boolean} - The new download status.
 * @returns {Promise<boolean>} - A Promise that resolves to `true` if the update was successful, or `false` if an error occurred.
 * @example updateDownloadStatus('https://example.com/content.mp4', 'downloaded | downloading | not downloaded')
 */
async function updateDownloadStatus(contentUrl, status) {
    const db = lokiDb.newLoki();

    if (possibleStates.includes(status)) {
        try {
            const contentInDb = await db.content.findOne({ url: contentUrl });
            if (contentInDb) {
                contentInDb.download = status;
                contentInDb.localPath = `${os.tmpdir()}/player/content/${contentUrl
                    .split('/')
                    .pop()}`;

                await db.content.update(contentInDb);
            }
            return true;
        } catch (error) {
            console.error(error);
        }
    } else {
        console.error(
            'The status must be "downloaded", "downloading", or "not downloaded".'
        );
    }
}

module.exports = {
    addToQueue,
    addArrayToQueue,
    updateDownloadStatus,
};
