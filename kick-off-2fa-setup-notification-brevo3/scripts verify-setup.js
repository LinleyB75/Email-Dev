// Checks that the project has the latest versions of every file, nothing left over from earlier
// versions, and nothing that should not be pushed to GitHub.
//   node scripts/verify-setup.js
const fs = require("fs");
const path = require("path");

const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);
let problems = 0;
const todo = [];
const ok = (msg) => console.log("  OK      " + msg);
const bad = (msg) => { problems++; console.log("  FIX     " + msg); };

console.log("1. The files that should exist");
for (const f of [
  "package.json", ".gitignore", ".env.example", "check-params.js", "send.js", "data/params.json",
  "templates/2fa-setup-notification.mjml", "scripts/check-build.js", "scripts/test-checks.js", "scripts/test-send.js",
  "scripts/simulated-brevo.js", "scripts/brevo-walkthrough.js", "scripts/make-dist.js",
]) fs.existsSync(f) ? ok(f) : bad(`${f} is missing`);

console.log("\n2. Files from earlier versions that should be gone");
const root = fs.readdirSync(".");
const strays = root.filter((n) => / /.test(n) && /\.js$/.test(n)); // for example "scripts test-send.js"
const old = ["scripts/fake-brevo.js", "scripts/simulate-brevo.js", "fake-brevo.js", "simulate-brevo.js"].filter((f) => fs.existsSync(f));
if (!strays.length && !old.length) ok("none found");
strays.forEach((n) => bad(`"${n}" is in the main folder with a space in its name. It belongs in scripts/ without the space`));
old.forEach((f) => bad(`${f} is an old file. Delete it`));

console.log("\n3. Each file is the latest version");
const marks = [
  ["send.js", 'resolve(answer.trim() === "SEND");', "the SEND confirmation fix"],
  ["send.js", "simulated Brevo", "the simulated Brevo wording"],
  ["scripts/test-send.js", "spawn(", "the version that starts the script asynchronously"],
  ["check-params.js", "otpauth", "the two-factor safety rules"],
  ["templates/2fa-setup-notification.mjml", "facebook-noshare", "icons that link to the client's page"],
  ["templates/2fa-setup-notification.mjml", "footer-logo", "the phone footer centring"],
  ["templates/2fa-setup-notification.mjml", "params.setupUrl", "the set-up link on the button"],
  ["scripts/simulated-brevo.js", "MAX_RECIPIENTS", "the version that follows Brevo's documented limits"],
  ["scripts/brevo-walkthrough.js", "test:brevo", "the walkthrough that can use your real account"],
];
for (const [f, text, what] of marks) {
  const c = read(f);
  if (c === null) continue;
  c.includes(text) ? ok(`${f}: ${what}`) : bad(`${f} is an older version (it lacks ${what}). Replace it with the latest`);
}
const t = read("scripts/test-send.js");
if (t && t.includes("spawnSync(")) bad("scripts/test-send.js uses the old spawnSync version. Replace it with the latest");

const pkg = read("package.json");
if (pkg) {
  let scripts = {};
  try { scripts = JSON.parse(pkg).scripts || {}; } catch { bad("package.json is not valid JSON (the red file in VS Code)"); }
  for (const s of ["prebuild", "build", "postbuild", "check-params", "test", "send:dry", "send:sandbox", "send:live", "test:send", "simulated-brevo", "simulate", "test:brevo"]) {
    if (!scripts[s]) bad(`package.json has no "${s}" script`);
  }
  if (scripts.send) bad('package.json still has a plain "send" script. Remove it: the safe ones are send:dry, send:sandbox and send:live');
  if (scripts["fake-brevo"]) bad('package.json still has "fake-brevo". Remove it');
  if (!/nunjucks/.test(pkg)) bad("package.json does not list nunjucks. Run: npm install --save-dev nunjucks");
}

console.log("\n4. Nothing that should not go to GitHub");
const gi = read(".gitignore") || "";
for (const line of ["node_modules", ".env", "simulated-inbox"]) {
  gi.split(/\r?\n/).map((l) => l.trim()).includes(line) ? ok(`.gitignore has ${line}`) : bad(`.gitignore is missing the line: ${line}`);
}
if (fs.existsSync(".env")) ok(".env exists here, and .gitignore keeps it out of Git");
// look for anything shaped like a real Brevo key, ignoring the obviously fake test strings in the scripts
const allowed = /not-real|not-a-real|looks-like|wrong-key|TESTKEY|SIMULATED/i;
const skip = new Set(["node_modules", ".git", "simulated-inbox", "dist"]);
const hits = [];
(function walk(dir) {
  for (const n of fs.readdirSync(dir)) {
    if (skip.has(n) || n === ".env") continue;
    const p = path.join(dir, n);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(js|json|md|mjml|html|txt|example)$/.test(n) && n !== ".env.example") continue;
    for (const m of fs.readFileSync(p, "utf8").matchAll(/x(?:keysib|smtpsib)-[A-Za-z0-9-]{20,}/g)) if (!allowed.test(m[0])) hits.push(p);
  }
})(".");
hits.length ? hits.forEach((p) => bad(`${p} contains what looks like a real Brevo key. Remove it and make a new key in Brevo`)) : ok("no real-looking API key in any file");
// the key-blocking hook lives in the Git repository's folder, which may be a parent folder
let dir = process.cwd(), gitDir = null;
while (true) { if (fs.existsSync(path.join(dir, ".git"))) { gitDir = path.join(dir, ".git"); break; } const up = path.dirname(dir); if (up === dir) break; dir = up; }
if (!gitDir) todo.push("No Git repository found yet. Run git init (or the project lives inside a parent folder that is a repository).");
else fs.existsSync(path.join(gitDir, "hooks", "pre-commit")) ? ok(`the key-blocking hook is in ${gitDir}`) : bad(`no pre-commit hook in ${gitDir}\\hooks. Add the key-blocking hook`);

console.log("\n5. Still to do before the template goes into Brevo (not errors)");
const m = read("templates/2fa-setup-notification.mjml") || "";
const n1 = (m.match(/src="https:\/\/REPLACE-WITH-YOUR-HOST/g) || []).length;
if (n1) todo.push(`${n1} icon links still say REPLACE-WITH-YOUR-HOST. Put in each icon's real address`);
if (/example\.com/.test(m)) todo.push("The Security and Privacy link still points at example.com");
if (/href="https:\/\/(www\.facebook|twitter|www\.instagram|www\.youtube)\.com\/"/.test(m)) todo.push("The social links still go to the sites' home pages");
if (!fs.existsSync("README.md")) todo.push("README.md is not written yet (that comes near the end)");
if (!fs.existsSync("BUILD-LOG.md")) todo.push("BUILD-LOG.md is missing. Save the attached one in the main folder");
todo.length ? todo.forEach((x) => console.log("  TO DO   " + x)) : console.log("  nothing");

console.log(problems ? `\n${problems} thing(s) to fix above.` : "\nAll good. Nothing to change.");
process.exit(problems ? 1 : 0);