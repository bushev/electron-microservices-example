const url = require('url');
const path = require('path');

const {app, BrowserWindow} = require('electron');

let mainWindow;

const createWindow = () => {

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 500,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, `/renderer/dist/index.html`),
        protocol: 'file:',
        slashes: true
    }));

    (async () => {
        const Loader = require('./main/bootstrap');

        await Loader.loadServices();
        await Loader.loadElectronBroker();
    })();

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
