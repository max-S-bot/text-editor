
const storage = sessionStorage;

const elems = {};
const elem = id => id in  elems ? elems[id] : elems[id] = document.getElementById(id);

window.addEventListener('load', async () => {
    const query = location.search.slice(1).split('&')
        .map(e => e.split('=')).reduce((a, c) => (a[c[0]] = c[1], a), {});
    if ('dir' in query)
        storage.dir = query.dir;
    history.pushState(null, null, location.origin);
    const r = await fetch('/dir', {
        method: 'GET',
        headers: storage.dir ? {'path' : storage.dir} : {},
    });
    const t = await r.text();
    handleDir(t, {dataset: {path: r.headers.get('dir')}});
});

const handleDir = (t, p, e) => {
    if (e?.ctrlKey)
        return window.open(`${window.location.origin}/?dir=${p.dataset.path}`);
    storage.dir = p.dataset.path;
    elem('dirName').innerHTML = storage.dir.substring(storage.dir.lastIndexOf('/') + 1);
    elem('dir').innerHTML = t;
    dealWithDots();
    for (const p of elem('dir').children) 
        if (p.nodeName === 'BUTTON')
            p.addEventListener('click', e =>
                fetch(p.dataset.uri, {
                    method: 'GET',
                    headers: {'path': p.dataset.path},
                }).then(r => r.text()).then(t => 
                    p.dataset.uri === '/dir' ? handleDir(t, p, e) : handleFile(t, p)));
}

const handleFile = (t, p) => [storage.file, elem('file').value] = [p.dataset.path, t];

elem('file').addEventListener('change', () => storage.file == null ? null : fetch('/file', {
    method: 'POST',
    headers: {'path': storage.file},
    body: elem('file').value,
}));

const dealWithDots = () => {
    const checked = elem('showDotFiles').checked;
    for (const p of elem('dir').children)
        if (p.innerHTML[0] === '.' && p.innerHTML !== '..')
            p.style = p.nextElementSibling.style = checked ? '' : 'display: none;';    
}

elem('showDotFiles').addEventListener('input', dealWithDots);

elem('file').addEventListener('keydown', e => {
    if (e.key === 'Tab') handleTab(e, elem('file'));
    if (e.key === '/' && e.ctrlKey) handleComment(e, elem('file'));
});

const handleTab = (e, text) => {
    e.preventDefault();
    const start = text.selectionStart;
    const end = text.selectionEnd;
    text.value = text.value.substring(0, start) + '    ' + text.value.substring(end);
    text.selectionStart = text.selectionEnd = start + 4;
};

const handleComment = (e, text) => {
    e.preventDefault();
};

elem('in').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
    e.preventDefault();
    const com = elem('in').value;
    elem('out').innerHTML += '$ ' + com + '\n';
    elem('in').value = '';
    fetch('/term', {
        method: 'POST',
        body: com,
    }).then(r => r.text()).then(t => {
        elem('out').innerHTML += t; 
        elem('out').scrollTo(0, elem('out').scrollHeight);
    });
});
