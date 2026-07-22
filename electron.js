'use strict';

const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const handlers = require('./handlers.js');

protocol.registerSchemesAsPrivileged([{scheme: 'scheme', privileges: {
    standard: true,
    supportFetchAPI: true,
    corsEnabled: true,
    allowServiceWorkers: true,
    stream: true,
    codeCache: true,
    allowExtensions: true,
}}]);

app.whenReady().then(() => {
    protocol.handle('scheme', req => 
        fetch(req, new URL(req.url).pathname));
    const win = new BrowserWindow();
    win.loadURL('scheme://host/');
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});

app.on('browser-window-created', (_, w) => (w.maximize()));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const fetch = async (req, p) => p in paths ? handlers[paths[p]](req) : handlers.handleGet(p);

const paths = {
    '/dir': 'handleDir',
    '/file': 'handleFile',
    '/term': 'handleTerm',
};
