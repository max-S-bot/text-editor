
const elem = str => document.getElementById(str);

const dir = t => {
    elem('dir').innerHTML = t;
    dealWithDots();
    for (const p of elem('dir').children) 
        if (p.nodeName === 'BUTTON')
            p.addEventListener('click', () =>
                fetch(p.value).then(r => r.text()).then(t => (p.value.startsWith('/dir') ? dir : file)(t)));
}

const file = t => elem('file').value = t;

window.addEventListener('load', () => 
    fetch('/dir').then(r => r.text()).then(t => dir(t)));

elem('file').addEventListener('change', () => fetch('/file', {
    method: 'POST',
    body: elem('file').value
}));

const dealWithDots = () => {
    const checked = elem('showDotFiles').checked;
    for (const p of elem('dir').children)
        if (p.innerHTML[0] === '.' && p.innerHTML !== '..')
            p.style = p.nextElementSibling.style = checked ? '' : 'display: none;';    
}

elem('showDotFiles').addEventListener('input', dealWithDots);

elem('file').addEventListener('keydown', function(e) {
    console.log(e)
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
   this.selectionStart = this.selectionEnd = start + 4;
});
