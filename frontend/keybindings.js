elem('file').addEventListener('keydown', e => {
    if (e.key === 'Tab') handleTab(e, elem('file'));
    if (e.key === '/' && e.ctrlKey) handleComment(e, elem('file'));
});

const handleTab = (e, text) => {
    e.preventDefault();
    const start = text.selectionStart;
    const end = text.selectionEnd;
    text.value = text.value.substring(0, start) + ' '.repeat(config.tabSize) + text.value.substring(end);
    text.selectionStart = text.selectionEnd = start + 4;
};

const handleComment = (e, text) => {
    e.preventDefault();
};