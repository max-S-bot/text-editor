'use strict';

const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const fs = require('fs');
const {getPath, handleDir, getFile, postFile, handleTerm} = require('./util.js');

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

const fetch = async (req, p) => new Response(p in paths ? await paths[p](req) : fs.readFileSync(getPath(p)));

const paths = {
    '/dir': req => handleDir(req.headers),
    '/file': async req => req.method === 'GET' ? getFile(req.headers) : postFile(req.headers, await req.bytes()),
    '/term': async req => handleTerm(req.headers, await req.text()),
};
