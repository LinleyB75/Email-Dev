// Checks that the template and the client's params agree, so a misspelt name is caught early.
//   npm run check-params
// data/params.json is the example JSON the client sends. Replace it with theirs.
const fs = require("fs");

const template = fs.readFileSync("templates/account-setup.mjml", "utf8");
const params = JSON.parse(fs.readFileSync("data/params.json", "utf8"));

// 1. Everything the template reads: {{ params.x }}, {% if params.x %}, {% for c in params.x %}
const used = new Set();
for (const m of template.matchAll(/params\.([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)/g)) used.add(m[1]);

// Inside a loop the fields come from the loop name: {% for c in params.classes %} ... {{ c.day }}
const loops = {};
for (const m of template.matchAll(/\{%\s*for\s+(\w+)\s+in\s+params\.([\w.]+)\s*%\}/g)) loops[m[1]] = m[2];
for (const m of template.matchAll(/\{\{\s*(\w+)\.(\w+)\s*\}\}/g)) {
  if (loops[m[1]]) used.add(`${loops[m[1]]}[].${m[2]}`);
}

// 2. Everything the client's JSON has, as paths like plan.name and classes[].day
const given = new Set();
function walk(value, prefix) {
  if (Array.isArray(value)) {
    value.forEach((item) => item && typeof item === "object" && walk(item, prefix + "[]"));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${k}` : k;
      given.add(path);
      walk(v, path);
    }
  }
}
walk(params, "");

const missing = [...used].filter((p) => !given.has(p));
const unused = [...given].filter((p) => !used.has(p));

console.log(`The template reads ${used.size} params. The client's JSON has ${given.size}.`);
if (unused.length) {
  console.log("\nNOTE: the client's JSON has these, but the template never uses them:");
  unused.forEach((p) => console.log("  - " + p));
}
if (missing.length) {
  console.log("\nPROBLEM: the template reads these, but the client's JSON does not have them (they would show empty):");
  missing.forEach((p) => console.log("  - " + p));
  process.exit(1);
}
console.log("\nOK: every param the template reads is in the client's JSON.");