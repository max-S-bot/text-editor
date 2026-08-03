'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

const shells: Record<string, ChildProcess> = {};

const getPath = (p: string): string => path.join(import.meta.dirname, '..',
    p.startsWith('/?') || p === '/' ? '/frontend/index.html' : p);

const handleDir = (path: string, id: string): string => {
    if (!(id in shells))
        shells[id] = spawn('bash');
    return JSON.stringify(formatDir(path));
};

const formatDir = (dir: string): {uri: string, path: string, name: string}[] => {
    const entries = [{uri: '/dir', path: path.parse(dir).dir, name: '..'}];
    for (const p of fs.readdirSync(dir, {withFileTypes: true}))
        entries.push({
            uri: p.isDirectory() ? '/dir' : '/file', 
            path: path.join(p.parentPath, p.name), 
            name: p.name
        });
    return entries;
};

const getFile = (path: string): string => fs.readFileSync(path, 'utf-8');

const postFile = (path: string, body: Uint8Array): '' => (fs.writeFileSync(path, body), '');

const handleTerm = (id: string, body: string): Promise<string> => (shells[id]!.stdin?.write(`${body}\n`),
	new Promise(r => {shells[id]!.stdout!.on('data', out => r(out)); shells[id]!.stderr!.on('data', out => r(out))}));

export { getPath, handleDir, getFile, postFile, handleTerm };
