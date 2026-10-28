// The Brevo part of the build as one walkthrough, with the same steps whichever Brevo it talks to.
//   npm run simulate     against the simulated Brevo on your computer. Nothing real is called.
//   npm run test:brevo   against YOUR real Brevo account, using the values in .env.
//                        It sends exactly one email, to TEST_TO_EMAIL, and only after you type SEND.
require("dotenv").config({ path: process.env.ENV_FILE || ".env" });
const fs = require("fs");
const { spawn } = require("child_process");

const simulated = process.argv.includes("--simulated");
const HTML = "dist/2fa-setup-notification.html";
const indent = (s) => s.trim().split("\n").map((l) => "      " + l).join("\n");
const log = (s = "") => console.log(s);

// Runs send.js. With "autoInput" the answer to the SEND prompt is typed for you (simulated only).
function runSend(args, env, autoInput) {
  return new Promise((resolve) => {
    const interactive = autoInput === undefined;
    const child = spawn("node", ["send.js", ...args], { env, stdio: [interactive ? "inherit" : "pipe", "pipe", interactive ? "inherit" : "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => { out += d; if (interactive) process.stdout.write(d); });
    if (!interactive) { child.stderr.on("data", (d) => (out += d)); child.stdin.write(autoInput); child.stdin.end(); }
    child.on("close", (code) => resolve({ code, out }));
  });
}
const apiCall = (base, key) => (method, p, body) =>
  fetch(base + p, { method, headers: { "api-key": key, accept: "application/json", "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10000) })
    .then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let base, key, templateId, testTo, sim, env;

  if (simulated) {
    const { startSimulatedBrevo } = require("./simulated-brevo");
    if (!fs.existsSync(HTML)) { console.error("Run npm run build first."); process.exit(1); }
    sim = await startSimulatedBrevo({});
    base = `http://127.0.0.1:${sim.port}`; key = sim.apiKey; testTo = "tester@example.test";
    log("SIMULATED TESTING. Brevo's documented behaviour is simulated on your own computer. Nothing real is called.\n");
    const call = apiCall(base, key);
    log("Step 7b. Brevo: Transactional > Templates > New Template, paste the HTML");
    const r = await call("POST", "/v3/smtp/templates", { templateName: "Kick Off 2FA setup notification (test)", subject: "Two-factor authentication is now on for your account", sender: { name: "Test sender", email: "sender@example.test" }, htmlContent: fs.readFileSync(HTML, "utf8"), isActive: false });
    templateId = r.data.id;
    log(`      template created, status ${r.status}, template ID ${templateId}, active: no`);
    env = { PATH: process.env.PATH, ENV_FILE: "/nonexistent-env-file", BREVO_BASE_URL: base, BREVO_API_KEY: key, BREVO_TEMPLATE_ID: String(templateId), TEST_TO_EMAIL: testTo };
    log("\nA mistake worth knowing: sending before the template is activated");
    log(indent((await runSend(["--sandbox"], env, "")).out));
    log("\nStep 7b (continued). Save and Activate");
    await call("PUT", `/v3/smtp/templates/${templateId}`, { isActive: true });
    log("      template is now active");
  } else {
    base = process.env.BREVO_BASE_URL || "https://api.brevo.com"; key = process.env.BREVO_API_KEY; templateId = process.env.BREVO_TEMPLATE_ID; testTo = process.env.TEST_TO_EMAIL;
    if (!key || !templateId || !testTo) { console.error("Fill in BREVO_API_KEY, BREVO_TEMPLATE_ID and TEST_TO_EMAIL in .env first."); process.exit(1); }
    env = { ...process.env };
    log("TESTING AGAINST YOUR REAL BREVO ACCOUNT.");
    log(`One email will be sent to ${testTo[0]}***@${testTo.split("@")[1]}, and only after you type SEND.`);
    log(`Template ID ${templateId}. Create and activate it in Brevo first (Step 7b).\n`);
  }
  const call = apiCall(base, key);

  log("\nStep 7c. npm run send:dry");
  let x = await runSend([], env, simulated ? "" : undefined);
  if (simulated) log(indent(x.out.split("\n").slice(0, 2).join("\n") + "\n  ... the JSON request ..."));

  log("\nStep 7c. npm run send:sandbox");
  x = await runSend(["--sandbox"], env, simulated ? "" : undefined);
  if (simulated) log(indent(x.out));
  if (x.code !== 0) { log("\nThe sandbox call failed. Fix that before the live send."); if (sim) await sim.close(); process.exit(1); }
  if (simulated) log(`      messages in the log after the sandbox call: ${sim.messages.length} (the sandbox leaves no log)`);

  if (simulated) {
    log("\nA wrong API key");
    log(indent((await runSend(["--sandbox"], { ...env, BREVO_API_KEY: "xkeysib-wrong-key" }, "")).out));
  }

  log("\nStep 7c. npm run send:live");
  x = await runSend(["--live"], env, simulated ? "SEND\n" : undefined);
  if (simulated) log(indent(x.out));
  const messageId = (x.out.match(/messageId: (<[^>\s]+>)/) || [])[1];
  if (x.code !== 0 || !messageId) { log("\nThe live send did not complete, so there is nothing more to check."); if (sim) await sim.close(); process.exit(1); }

  log("\nStep 7d. Brevo's transactional log");
  let found = null;
  for (let attempt = 1; attempt <= (simulated ? 1 : 4) && !found; attempt++) {
    const r = await call("GET", `/v3/smtp/emails?messageId=${encodeURIComponent(messageId)}`);
    const list = r.data.transactionalEmails || [];
    if (r.status === 200 && list.length) found = list[0];
    else if (attempt < 4 && !simulated) { log(`      not in the log yet (status ${r.status}), trying again in 3 seconds...`); await wait(3000); }
  }
  if (found) log(`      found: ${found.email ? found.email[0] + "***" : "(address hidden)"}  subject "${found.subject || "?"}"  template ${found.templateId ?? "?"}  ${found.date || ""}`);
  else log("      not found in the log. Look in Brevo under Transactional > Logs and check the message ID above.");

  if (simulated) {
    log("\nThe saved inbox message, checked:");
    sim.messages[0].report.forEach((c) => log(`      ${c.ok ? "PASS" : "WARN"}  ${c.label}`));
    log(`      open simulated-inbox/index.html to see it listed like a mailbox`);
    log("\nA missing first name (the greeting should fall back)");
    const noName = JSON.parse(fs.readFileSync("data/params.json", "utf8")); delete noName.firstName;
    fs.writeFileSync("simulated-inbox/params-no-name.json", JSON.stringify(noName));
    await runSend(["simulated-inbox/params-no-name.json", "--live"], env, "SEND\n");
    const html2 = fs.readFileSync(sim.messages[1].file, "utf8");
    log(`      greeting in the second message: "${(html2.match(/Hi there,|Hi [A-Za-z]+,/) || ["not found"])[0]}"`);
    log("\nThis was simulated testing. The real test is the same steps against your own Brevo account: npm run test:brevo");
    await sim.close();
  } else {
    log("\nNow look in your inbox (and spam):");
    ["The sender and the subject are right", "The greeting says Hi and the name, and the masked username shows", "The orange icons show on the grey, with no broken images", "The button's link goes to the set-up address", "Both logos and the address show in the footer", "It looks right on your phone as well as your computer"].forEach((c) => log(`      [ ] ${c}`));
    log("\nWrite what you see in BUILD-LOG.md.");
  }
})();