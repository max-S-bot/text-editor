'use strict';

elem('file').addEventListener('keydown', e => {
    if (e.key === 'Tab') handleTab(e, elem('file'));
    if (e.key === '/' && e.ctrlKey) handleComment(e, elem('file'));
});

const handleTab = (e, text) => {
    e.preventDefault();
    const start = text.selectionStart;
    const end = text.selectionEnd;
    text.value = text.value.substring(0, start) + ' '.repeat(config.tabSize) + text.value.substring(end);
    text.selectionStart = text.selectionEnd = start + config.tabSize;
};

const handleComment = (e, text) => {
    e.preventDefault();
    const str = text.value;
    let start = text.selectionStart;
    for (; str[start] !== '\n' && start !== 0; start--);
    let end = text.selectionEnd;
    for (; str[end] !== '\n' && end < str.length; end++);
};