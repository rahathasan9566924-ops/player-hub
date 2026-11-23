import { readFileSync } from "node:fs";
import vm from "node:vm";
const html = readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*\\bsrc=)[^>]*>([\\s\\S]*?)<\\/script>/gi)];
if (!scripts.length) throw new Error("No inline application script found");
for (const [index, match] of scripts.entries()) new vm.Script(match[1], { filename: `index.html:inline-script-${index + 1}` });
console.log(`Validated ${scripts.length} inline script block(s).`);
