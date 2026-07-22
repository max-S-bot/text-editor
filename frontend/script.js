'use strict';

import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from "@codemirror/commands";
import { Text, EditorState } from '@codemirror/state'
import { indentUnit } from '@codemirror/language';
import { languages } from '@codemirror/language-data';

let config;
let file;

const langs = languages.reduce((ls, l) => {
    for (const e of l.extensions)
        ls[e] = l;
    return ls;
}, {});

const storage = sessionStorage;

const elems = {};
const elem = id => id in  elems ? elems[id] : elems[id] = document.getElementById(id);

(async () => {
    config = await ((await fetch('/config.json')).json())
    indentUnit.default = ' '.repeat(config.tabSize);
    file = new EditorView({
        parent: elem('file'),
        extensions: [basicSetup, keymap.of(indentWithTab)],
    });
    const query = location.search.slice(1).split('&')
        .map(e => e.split('=')).reduce((a, c) => (a[c[0]] = c[1], a), {});
    if ('file' in storage)
        fetch('/file', {headers: {path: storage.file}})
            .then(r => r.text()).then(t => 
                handleFile(t, {dataset: {path: storage.file}}));
    const headers = {};
    if (!storage.id)
        storage.id = String(Date.now() + Math.random());
    headers.id = storage.id
    if (!storage.dir)
        storage.dir = 'dir' in query ? query.dir : config.startDir;
    headers.path = storage.dir;
    const r = await fetch('/dir', {headers: headers});
    const t = await r.text();
    handleDir(t, {dataset: {path: storage.dir}});
})();

const handleDir = (t, p, e) => {
    if (e?.ctrlKey)
        return open(`${location.origin}${location.pathname}?dir=${p.dataset.path}`, '_blank', 'noopener=true');
    storage.dir = p.dataset.path;
    elem('dirName').innerHTML = storage.dir.substring(storage.dir.lastIndexOf('/') + 1);
    elem('dir').innerHTML = t;
    dealWithDots();
    for (const p of elem('dir').children) 
        if (p.nodeName === 'BUTTON')
            p.addEventListener('click', e =>
                fetch(p.dataset.uri, {headers: {path: p.dataset.path}})
                    .then(r => r.text()).then(t => 
                        p.dataset.uri === '/dir' ? handleDir(t, p, e) : handleFile(t, p)));
}

const handleFile = async (t, p) => {
    storage.file = p.dataset.path;
    const extensions = [basicSetup, keymap.of(indentWithTab)]
    const idx = storage.file.lastIndexOf('.');
    const ext = storage.file.slice(idx + 1);
    if (idx !== -1 && ext in langs)
        extensions.push(await langs[ext].load());
    file.setState(EditorState.create({
        doc: t,
        extensions,
    }));
};

elem('file').addEventListener('keydown', () => storage.file == null ? null : fetch('/file', {
    method: 'POST',
    headers: {path: storage.file},
    body: file.state.doc.toString(),
}));

const dealWithDots = () => {
    const checked = elem('showDotFiles').checked;
    for (const p of elem('dir').children)
        if (p.innerHTML[0] === '.' && p.innerHTML !== '..')
            p.style = p.nextElementSibling.style = checked ? '' : 'display: none;';    
}

elem('showDotFiles').addEventListener('input', dealWithDots);

elem('in').addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    const com = elem('in').value;
    elem('out').innerHTML += '$ ' + com + '\n';
    elem('in').value = '';
    fetch('/term', {
        method: 'POST',
        headers: {id: storage.id},
        body: com,
    }).then(r => r.text()).then(t => {
        elem('out').innerHTML += t; 
        elem('out').scrollTo(0, elem('out').scrollHeight);
    });
});
