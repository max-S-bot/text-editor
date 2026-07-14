'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronFetch', (path, options) => 
    ipcRenderer.invoke('fetch', path, options));