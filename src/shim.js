import { createRequire } from 'module';
import path from 'path';
import { setWidgetPath } from './deterministic-tests.js';
export const mkDir = async (path) => {
    const require = createRequire(import.meta.url);
    var fs = require('fs');
    try {
        var dir = path;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            return true;
        }
    }
    catch (error) {
        console.error(`Error making directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
};
export const ls = async (dir) => {
    // ls.js
    const require = createRequire(import.meta.url);
    const fs = require('fs');
    const path = require('path');
    try {
        // Read directory contents
        const files = fs.readdirSync(dir);
        let result = [];
        // Print each entry
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            console.log(file);
            if (stats.isDirectory()) {
                result.push({ name: file, type: "directory", path: fullPath });
            }
            else {
                result.push({ name: file, type: "file", path: fullPath });
            }
        }
        return result;
    }
    catch (error) {
        console.error(`Error reading directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
    }
};
export const readDoc = async (path) => {
    const require = createRequire(import.meta.url);
    const fs = require('fs');
    try {
        const c = fs.readFileSync(path, 'utf-8');
        return { content: c };
    }
    catch (error) {
        console.error(`Error reading document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return undefined;
    }
};
export const writeDoc = async (fpath, content, encoding) => {
    const require = createRequire(import.meta.url);
    const fs = require('fs');
    try {
        const dir = path.dirname(fpath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Write to the file (creates it if it doesn't exist)
        fs.writeFileSync(fpath, content, { encoding: encoding });
        setWidgetPath(fpath);
        return true;
    }
    catch (error) {
        console.error(`Error reading document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return undefined;
    }
};
//await mkDir("/hello/new");
// console.log((await ls("new")).map(x => JSON.stringify(x)));
//console.log(JSON.stringify(await readDoc("new/file/hello.js")));
//await writeDoc("new/file/superepicfile.js", "console.log();", "utf8");

