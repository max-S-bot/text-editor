'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const shells = {};

const getPath = p => path.join(__dirname, '..',
    p.startsWith('?') || p === '/' ? '/frontend/index.html' : p);

const handleDir = headers => {
    const id = headers.get('id');
    if (!(id in shells))
        shells[id] = spawn('bash');
    return formatDir(headers.get('path'));
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

const getFile = headers => fs.readFileSync(headers.get('path'));

const postFile = (headers, body) => (fs.writeFileSync(headers.get('path'), body), '');

const handleTerm = (headers, body) => (shells[headers.get('id')].stdin.write(`${body}\n`),
	new Promise(r => shells[headers.get('id')].stdout.on('data', out => r(out))));

module.exports = { getPath, handleDir, getFile, postFile, handleTerm };
