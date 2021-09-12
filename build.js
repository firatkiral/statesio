const { execSync } = require('child_process');
const fs = require("fs-extra");

function process(ext = "js") {
    !fs.existsSync(`./dist`) && fs.mkdirSync(`./dist`);
    fs.renameSync(`./build/state.js`, `./dist/state.${ext}`);
    fs.renameSync(`./build/state.d.ts`, `./dist/state.d.ts`);
}

// Node
console.log(`Node package compiling...`);
execSync('npx tsc --module commonjs');
process('js');
console.log("Done\n");

// web
console.log(`Web package compiling...`);
execSync('npx tsc');
process('module.js');
fs.rmSync(`./build`, { recursive: true });
console.log("Done\n");



