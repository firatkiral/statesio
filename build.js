
const { execSync } = require('child_process');
const fs = require("fs-extra");

// tsc
console.log(`TypeScript compiling...`);
execSync('npx tsc');
console.log("Done\n");

// esm & web
console.log(`Webpack compiling...`);
execSync('npx webpack');
console.log("Done\n");

fs.rmSync(`./build`, { recursive: true });

