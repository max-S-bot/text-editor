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
    protocol.handle('file', req => 
        fetch(req, new URL(req.url).pathname));
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const fetch = async (req, p) => p in paths ? paths[p](req) : handleGet(p);

const handleGet = p => new Response(fs.readFileSync(path.join('.', p)));

const handleDir = req => new Response(formatDir(req.headers.get('path')));
// {
//     if (options.headers.loading)
//         var id = e.getRequestHeaders().getFirst("id");
//         if (!shells.containsKey(id))
//             shells.put(id, new Shell());
// };

const formatDir = dir => {
    let sb = '<button data-uri="/dir" data-path="' + path.parse(dir).dir + '">..</button><br>';
    for (const p of fs.readdirSync(dir, {withFileTypes: true}))
        sb += '<button data-uri="/' +
        (p.isDirectory() ? 'dir' : 'file') + 
        '" data-path="' + path.join(p.parentPath, p.name) + '">' + 
        p.name + '</button><br>';
    return sb;
};


const handleFile = req => req.method !== 'POST' 
    ? new Response(fs.readFileSync(req.headers.get('path')))
    : (fs.writeFileSync(req.headers.get('path'), req.body), new Response());

const handleTerm = req => {

};

const paths = {
    '/dir': handleDir,
    '/file': handleFile,
    '/term': handleTerm,
};