'use strict';

import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from "@codemirror/commands";
import { Text, EditorState } from '@codemirror/state'
import { indentUnit } from '@codemirror/language';
import { languages } from '@codemirror/language-data';

let config;

const langs = languages.reduce((ls, l) => {
    for (const e of l.extensions)
        ls[e] = l;
    return ls;
}, {});

const storage = sessionStorage;
const term = 'term' in storage ? JSON.parse(storage.term) : [];
let termIdx = term.length;
let termFocus = false;

const elems = {};
const elem = id => id in  elems ? elems[id] : elems[id] = document.getElementById(id);

const file = new EditorView({
    parent: elem('file'),
    extensions: [basicSetup, keymap.of(indentWithTab)],
});

(async () => {
    config = await ((await fetch('/config.json')).text());
    indentUnit.default = ' '.repeat(config.tabSize);
    const query = location.search.slice(1).split('&')
        .map(e => e.split('=')).reduce((a, c) => (a[c[0]] = c[1], a), {});
    if ('file' in storage)
        fetch('/file', {headers: {path: storage.file}})
            .then(r => r.text()).then(t => 
                handleFile(t, {path: storage.file}));
    const headers = {};
    if (!storage.id)
        storage.id = String(Date.now() + Math.random());
    headers.id = storage.id;
    if (!storage.dir)
        storage.dir = 'dir' in query ? query.dir : config.startDir;
    headers.path = storage.dir;
    fetch('/dir', {headers: headers}).then(async r => handleDir(await r.text(), {path: storage.dir}))
})();

const handleDir = (t, e, ev) => {
    if (ev?.ctrlKey)
        return open(`${location.origin}${location.pathname}?dir=${e.path}`, '_blank', 'noopener=true');
    storage.dir = e.path;
    elem('dirName').innerHTML = storage.dir.substring(storage.dir.lastIndexOf('/') + 1);
    elem('dir').innerHTML = ''
    for (const e of JSON.parse(t)) {
        const b = document.createElement('button');
        b.innerHTML = e.name;
        b.addEventListener('click', ev =>
            fetch(e.uri, {headers: {path: e.path}})
                .then(r => r.text()).then(t => 
                    e.uri === '/dir' ? handleDir(t, e, ev) : handleFile(t, e)));
        elem('dir').appendChild(b);
        elem('dir').appendChild(document.createElement('br'));
    }
    dealWithDots();
}

const handleFile = async (t, e) => {
    storage.file = e.path;
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

elem('in').addEventListener('focusin', () => termFocus = true);
elem('in').addEventListener('focusout', () => termFocus = false);

elem('in').addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && (termIdx - 1) in term)
        elem('in').value = term[--termIdx],
        e.preventDefault(),
        elem('in').selectionStart = elem('in').textLength;
    if (e.key === 'ArrowDown' && termIdx in term) 
        elem('in').value = ++termIdx === term.length ? '' : term[termIdx];
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    const com = elem('in').value;
    term.push(com);
    termIdx = term.length;
    storage.term = JSON.stringify(term);
    elem('out').innerHTML += `$ ${com}\n`;
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

document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.code === 'Backquote')
        termFocus ? file.focus() : elem('in').focus()
});
