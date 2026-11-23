import { readFileSync } from "node:fs";
import vm from "node:vm";
const html = readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
if (!scripts.length) throw new Error("No script blocks found");
let count = 0;
for (const match of scripts) {
  if (!match[1].trim()) continue;
  new vm.Script(match[1], { filename: "index.html:inline-script-" + (++count) });
}
if (!count) throw new Error("No inline JavaScript found");
console.log("Validated " + count + " inline script block(s).");
