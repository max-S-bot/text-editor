'use strict';

const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.maximize()
    win.loadFile('/frontend/index.html');
}
app.whenReady().then(() => {
    ipcMain.handle('fetch', require('./server.js'));
    protocol.handle('file', req => {
        console.log(req)
        return new Response(fs.readFileSync(path.join('.', new URL(req.url).pathname)));
    })
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    })
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});