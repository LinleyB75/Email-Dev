// Sends the two-factor setup email through Brevo, using a template ID and the JSON params.
//   npm run send:dry       prints the request and sends nothing (this is also the default)
//   npm run send:sandbox   calls Brevo with its sandbox header: nothing is sent, no log is made
//   npm run send:live      sends ONE real email to TEST_TO_EMAIL, after you type SEND
require("dotenv").config({ path: process.env.ENV_FILE || ".env" });
const fs = require("fs");
const readline = require("readline");
const { checkParams } = require("./check-params");

const args = process.argv.slice(2);
const mode = args.includes("--live") ? "live" : args.includes("--sandbox") ? "sandbox" : "dry";
const paramsFile = args.find((a) => !a.startsWith("--")) || "data/params.json";

const { BREVO_API_KEY, BREVO_TEMPLATE_ID, TEST_TO_EMAIL } = process.env;
const BASE_URL = process.env.BREVO_BASE_URL || "https://api.brevo.com"; // only set BREVO_BASE_URL to use the simulated Brevo
const mask = (email) => (email && email.includes("@") ? `${email[0]}***@${email.split("@")[1]}` : "(not set)");
const fail = (msg) => { console.error(msg); process.exit(1); };

// 1. Never send params that fail the safety checks
const params = JSON.parse(fs.readFileSync(paramsFile, "utf8"));
const check = checkParams(params, fs.readFileSync("templates/2fa-setup-notification.mjml", "utf8"));
if (check.errors.length) {
  console.error("NOT SENDING. The params did not pass the checks:");
  check.errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}

// 2. The request Brevo receives
const body = {
  to: [{ email: TEST_TO_EMAIL || "you@example.com", ...(params.firstName ? { name: params.firstName } : {}) }],
  templateId: Number(BREVO_TEMPLATE_ID || 1),
  params,
};
// Brevo's sandbox flag goes in the JSON body's "headers" object, not in the HTTP headers
if (mode === "sandbox") body.headers = { "X-Sib-Sandbox": "drop" };

if (mode === "dry") {
  const shown = { ...body, to: body.to.map((t) => ({ ...t, email: mask(t.email) })) };
  console.log(`DRY RUN. Nothing sent. This is the request to ${BASE_URL}/v3/smtp/email:\n`);
  console.log(JSON.stringify(shown, null, 2));
  process.exit(0);
}

// 3. Sandbox and live need a real key, template ID and test address
if (!BREVO_API_KEY || !BREVO_TEMPLATE_ID || !TEST_TO_EMAIL) fail("Fill in BREVO_API_KEY, BREVO_TEMPLATE_ID and TEST_TO_EMAIL in .env");
if (!Number.isInteger(body.templateId) || body.templateId < 1) fail("BREVO_TEMPLATE_ID must be a whole number such as 12");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(TEST_TO_EMAIL)) fail("TEST_TO_EMAIL is not a valid email address");
if (/^xsmtpsib-/i.test(BREVO_API_KEY)) console.warn("Warning: this looks like an SMTP key. The API usually needs an API key (it starts with xkeysib-).");
if (process.env.BREVO_BASE_URL) console.warn(`Using the simulated Brevo at ${BASE_URL}.`);

function confirmLive() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`This will SEND an email${process.env.BREVO_BASE_URL ? " (to the simulated Brevo)" : ""} to ${mask(TEST_TO_EMAIL)} using template ${body.templateId}.\nType SEND to continue: `, (answer) => {
      resolve(answer.trim() === "SEND"); // answer first, then close, or the close handler would win
      rl.close();
    });
    rl.on("close", () => resolve(false)); // closed with no answer (for example a piped, empty input)
  });
}

async function main() {
  if (mode === "live" && !(await confirmLive())) fail("Cancelled. Nothing was sent.");

  let res;
  try {
    res = await fetch(`${BASE_URL}/v3/smtp/email`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "api-key": BREVO_API_KEY },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    fail("Could not reach Brevo: " + err.message);
  }
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`Brevo said no. Status ${res.status}${data.code ? " (" + data.code + ")" : ""}: ${data.message || "no message"}`);
    process.exit(1);
  }
  if (mode === "sandbox") {
    console.log(`Sandbox: Brevo accepted the request (status ${res.status}). No email was sent and no log was made.`);
    console.log("The sandbox only checks the request. It does not show how the email looks.");
  } else {
    console.log(`Sent to ${mask(TEST_TO_EMAIL)}. Status ${res.status}. Brevo messageId: ${data.messageId}`);
    console.log("Accepted is not the same as delivered. Check Transactional > Logs in Brevo, then open the email in your inbox.");
  }
}
main();