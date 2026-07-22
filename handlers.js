'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const shells = {};

const handleGet = p => new Response(fs.readFileSync(path.join('.', 
    p.startsWith('?') || p === '/' ? './frontend/index.html' : p)));

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

module.exports = { handleGet, handleDir, handleFile, handleTerm };