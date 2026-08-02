'use strict';

import { app, BrowserWindow, protocol } from 'electron';
import * as fs from 'fs';
import { getPath, handleDir, getFile, postFile, handleTerm } from './util.js';

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
    protocol.handle('scheme', (req: Request) => 
        fetch(req, new URL(req.url).pathname));
    const win = new BrowserWindow();
    win.loadURL('scheme://host/');
});

app.on('browser-window-created', (_, w) => (w.maximize()));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const fetch = async (req: Request, p: string): Promise<Response> => 
    new Response(p in paths ? await paths[p]!(req) : fs.readFileSync(getPath(p)));

const paths: Record<string, (req: Request) => string | Promise<string>> = {
    '/dir': (req: Request): string => handleDir(req.headers.get('path')!, req.headers.get('id')!),
    '/file': async (req: Request): Promise<string> => 
        req.method === 'GET' ? getFile(req.headers.get('path')!) : postFile(req.headers.get('path')!, await req.bytes()),
    '/term': async (req: Request): Promise<string> => handleTerm(req.headers.get('id')!, await req.text()),
} as const;
