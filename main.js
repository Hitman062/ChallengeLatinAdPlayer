const { app, ipcMain, BrowserWindow, Menu, MenuItem } = require('electron');
const db = require('./src/utils/lokidb.utils');
const os = require('os');
const fs = require('fs');

const {
    updateLocalContents,
    getContentDowloaded,
} = require('./src/services/content.services');
const { getConfig } = require('./src/services/player.services');

const localPath = `${os.tmpdir()}/player/content/`;
if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath, { recursive: true });
}

let mainWindow;

app.whenReady().then(async () => {
    await db.init();

    updateContent();

    const configApp = await getConfig();

    mainWindow = new BrowserWindow({
        width: configApp.width,
        height: configApp.height,
        fullscreen: configApp.fullscreen,
        x: configApp.x,
        y: configApp.y,
        frame: false,
        autoHideMenuBar: true,
        resizable: false,
        movable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.webContents.on('did-finish-load', async () => {
        sendPlaylist();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

function updateContent() {
    setInterval(async () => {
        await updateLocalContents();
        sendPlaylist();
    }, 10000);
}

async function sendPlaylist() {
    const contentDownloaded = await getContentDowloaded();

    mainWindow.webContents.send('send-content-list', contentDownloaded);
    return true;
}
