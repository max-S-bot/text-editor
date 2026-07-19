'use strict';

const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;

const shells = {};

const createWindow = () => {
    const win = new BrowserWindow();
    win.loadFile('/frontend/index.html');
}

app.whenReady().then(() => {
    protocol.handle('file', req => 
        fetch(req, new URL(req.url).pathname));
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    })
});

app.on('browser-window-created', (_, w) => (w.maximize()));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const fetch = async (req, p) => p in paths ? paths[p](req) : handleGet(p);

const handleGet = p => new Response(p.startsWith('?') ? './frontend/index.html' : fs.readFileSync(path.join('.', p)));

const handleDir = req => {
    const id = req.headers.get('id');
    if (!(id in shells))
        shells[id] = spawn('bash');
    return new Response(formatDir(req.headers.get('path')));
};

const formatDir = dir => {
    let sb = '<button data-uri="/dir" data-path="' + path.parse(dir).dir + '">..</button><br>';
    for (const p of fs.readdirSync(dir, {withFileTypes: true}))
        sb += '<button data-uri="/' +
        (p.isDirectory() ? 'dir' : 'file') + 
        '" data-path="' + path.join(p.parentPath, p.name) + '">' + 
        p.name + '</button><br>';
    return sb;
};


const handleFile = req => req.method === 'GET' 
    ? new Response(fs.readFileSync(req.headers.get('path')))
    : (fs.writeFileSync(req.headers.get('path'), req.body), new Response());

const handleTerm = async req => (shells[req.headers.get('id')].stdin.write(`${await req.text()}\n`),
	await new Promise(r => shells[req.headers.get('id')].stdout.on('data', out => r(new Response(out)))));

const paths = {
    '/dir': handleDir,
    '/file': handleFile,
    '/term': handleTerm,
};
