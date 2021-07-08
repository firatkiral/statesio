const { execSync } = require('child_process');
const fs = require("fs-extra");

function process(ext = "js") {
    !fs.existsSync(`./dist`) && fs.mkdirSync(`./dist`);
    fs.renameSync(`./build/undoKit.js`, `./dist/undoKit.${ext}`);
    fs.renameSync(`./build/undoKit.d.ts`, `./dist/undoKit.d.ts`);
}

// Node
console.log(`Node package compiling...`);
execSync('npx tsc --module commonjs');
process('cjs');
console.log("Done\n");

// web
console.log(`Web package compiling...`);
execSync('npx tsc');
process('mjs');
fs.rmdirSync(`./build`, { recursive: true });
console.log("Done\n");



