const fs = require('fs/promises');
const path = require('path');

(async () => {
    console.log('---PDF title remover---\n');
    await clearOut();
    removeTitle();
})();

async function clearOut() {
    const files = await fs.readdir(path.resolve(__dirname, 'out'));
    console.log(`clear ${files.length} old outputs`);
    files.forEach(async (f, i) => {
        console.log('  clear ', i, f);
        await fs.unlink(path.join(__dirname, `out/${f}`));
    });
}

async function removeTitle() {
    const files = await fs.readdir(path.resolve(__dirname, 'in'));
    console.log(`\nprocess ${files.length} new inputs`);
    files.forEach(async (f, i) => {
        console.log('  write ', i, f);
        let newBuffer = await fs.readFile(path.resolve(__dirname, `in/${f}`));
        if (newBuffer.indexOf('<</Title') >= 0) {
            const titleIndex = newBuffer.indexOf('<</Title');
            const titleIndex2 = newBuffer.indexOf(')', titleIndex);
            let sliceChars = ['(', ')'];
            if (titleIndex2 > -1 && titleIndex2 < newBuffer.indexOf('\n', titleIndex)) {
                sliceChars = ['(', ')'];
            } else {
                sliceChars = ['<', '>'];
            }
            newBuffer = Buffer.concat([
                newBuffer.slice(0, newBuffer.indexOf(sliceChars[0], titleIndex + 3) + 1),
                newBuffer.slice(newBuffer.indexOf(sliceChars[1], titleIndex), newBuffer.length)
            ]);
        }
        if (newBuffer.includes('<dc:title>')) {
            newBuffer = Buffer.concat([
                newBuffer.slice(
                    0,
                    newBuffer.indexOf('>', newBuffer.indexOf('<dc:title')) + 1),
                newBuffer.slice(
                    newBuffer.indexOf('</dc:title>', newBuffer.indexOf('<dc:title>')),
                    newBuffer.length)
            ]);
        }
        await fs.writeFile(path.resolve(__dirname, `out/${f}`), newBuffer);
    });
}