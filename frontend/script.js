let config;
fetch('/config.json').then(r => r.json()).then(json => config = Object.freeze(json)); 
const storage = sessionStorage;

const elems = {};
const elem = id => id in  elems ? elems[id] : elems[id] = document.getElementById(id);

addEventListener('load', async () => {
    const query = location.search.slice(1).split('&')
        .map(e => e.split('=')).reduce((a, c) => (a[c[0]] = c[1], a), {});
    if ('dir' in query)
        storage.dir = query.dir;
    if ('file' in storage)
        fetch('/file'+storage.file, {
            method: 'GET',
            headers: {path: storage.file},
        }).then(r => r.text()).then(t => 
            handleFile(t, {dataset: {path: storage.file}}));
    history.pushState(null, null, location.origin);
    const headers = {};
    if (!storage.id)
        storage.id = String(Date.now() + Math.random());
    headers.id = storage.id
    if (storage.dir) headers.path = storage.dir;
    const r = await fetch('/dir', {
        method: 'GET',
        headers: headers,
    });
    const t = await r.text();
    handleDir(t, {dataset: {path: r.headers.get('dir')}});
});

const handleDir = (t, p, e) => {
    if (e?.ctrlKey)
        return open(`${location.origin}/?dir=${p.dataset.path}`, null, 'noopener=true');
    storage.dir = p.dataset.path;
    elem('dirName').innerHTML = storage.dir.substring(storage.dir.lastIndexOf('/') + 1);
    elem('dir').innerHTML = t;
    dealWithDots();
    for (const p of elem('dir').children) 
        if (p.nodeName === 'BUTTON')
            p.addEventListener('click', e =>
                fetch(p.dataset.uri, {
                    method: 'GET',
                    headers: {path: p.dataset.path},
                }).then(r => r.text()).then(t => 
                    p.dataset.uri === '/dir' ? handleDir(t, p, e) : handleFile(t, p)));
}

const handleFile = (t, p) => [storage.file, elem('file').value] = [p.dataset.path, t];

elem('file').addEventListener('keydown', () => storage.file == null ? null : fetch('/file', {
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

elem('in').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
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
