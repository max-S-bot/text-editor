'use strict';

const path = require('path');
const fs = require('fs');

const handleGet = p => [
    fs.readFileSync(path.join('.', p)),
    {status: 200, headers: {}},
];

const formatDir = dir => {
    let sb = '<button data-uri="/dir" data-path="' + path.parse(dir).dir + '">..</button><br>';
    for (const p of fs.readdirSync(dir, {withFileTypes: true}))
        sb += '<button data-uri="/' +
        (p.isDirectory() ? 'dir' : 'file') + 
        '" data-path="' + path.join(p.parentPath, p.name) + '">' + 
        p.name + '</button><br>';
    return sb;
};

const handleDir = options => {
    const dir = options.headers.path;
    // if (options.headers.loading)
        // var id = e.getRequestHeaders().getFirst("id");
        // if (!shells.containsKey(id))
            // shells.put(id, new Shell());
    return [formatDir(dir), {}];
};

const handleFile = options => {
    const file = options.headers.path;
    if (options.method !== 'POST')
        return [fs.readFileSync(file), {}];
    else
        return fs.writeFileSync(file, options.body), [null, {}];
};

const handleTerm = options => {

};

const paths = {
    '/dir': handleDir,
    '/file': handleFile,
    '/term': handleTerm,
};

module.exports = async (_, p, options) => p in paths ? paths[p](options) : handleGet(p);