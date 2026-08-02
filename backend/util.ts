'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

const shells: Record<string, ChildProcess> = {};

const getPath = (p: string): string => path.join(import.meta.dirname, '..',
    p.startsWith('?') || p === '/' ? '/frontend/index.html' : p);

const handleDir = (path: string, id: string) => {
    if (!(id in shells))
        shells[id] = spawn('bash');
    return formatDir(path);
};

const formatDir = (dir: string): string => {
    let sb = '<button data-uri="/dir" data-path="' + path.parse(dir).dir + '">..</button><br>';
    for (const p of fs.readdirSync(dir, {withFileTypes: true}))
        sb += '<button data-uri="/' +
        (p.isDirectory() ? 'dir' : 'file') + 
        '" data-path="' + path.join(p.parentPath, p.name) + '">' + 
        p.name + '</button><br>';
    return sb;
};

const getFile = (path: string): string => fs.readFileSync(path, 'utf-8');

const postFile = (path: string, body: Uint8Array): '' => (fs.writeFileSync(path, body), '');

const handleTerm = (id: string, body: string): Promise<string> => (shells[id]?.stdin?.write(`${body}\n`),
	new Promise(r => shells[id]?.stdout?.on('data', out => r(out))));

export { getPath, handleDir, getFile, postFile, handleTerm };
