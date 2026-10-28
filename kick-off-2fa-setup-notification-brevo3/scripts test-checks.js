// Proves the checks work: the good data must pass, and every deliberate break must be caught.
//   npm test
const fs = require("fs");
const { checkParams } = require("../check-params");

const template = fs.readFileSync("templates/2fa-setup-notification.mjml", "utf8");
const good = JSON.parse(fs.readFileSync("data/params.json", "utf8"));
const without = (key) => { const p = { ...good }; delete p[key]; return p; };

// [description, params, expected: "pass" or a piece of the message that must appear]
const cases = [
  ["the example data", good, "pass"],
  ["first name missing (optional)", without("firstName"), "pass"],
  ["first name empty (optional)", { ...good, firstName: "" }, "pass"],

  ["BREAK: setupUrl missing", without("setupUrl"), '"setupUrl" is required'],
  ["BREAK: misspelt name (setUpUrl)", { ...without("setupUrl"), setUpUrl: good.setupUrl }, '"setupUrl" is required'],
  ["BREAK: link is http, not https", { ...good, setupUrl: "http://app.example.com/2fa/setup?token=x" }, "must start with https://"],
  ["BREAK: link carries an authenticator link", { ...good, setupUrl: "https://app.example.com/?u=otpauth://totp/x" }, "must not carry a secret"],
  ["BREAK: username not masked", { ...good, maskedUsername: "alex.smith" }, "is not masked"],
  ["BREAK: username is a full email", { ...good, maskedUsername: "alex@example.com" }, "email address that is not masked"],
  ["BREAK: a 6-digit code in the first name", { ...good, firstName: "Alex 482913" }, "6 to 8 digit number"],
  ["BREAK: a setup key in the first name", { ...good, firstName: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP" }, "setup-key style"],
  ["BREAK: a QR link in the first name", { ...good, firstName: "otpauth://totp/Kick?secret=ABC" }, "QR or authenticator link"],
  ["BREAK: a full phone number", { ...good, firstName: "+55 85 99601 2344" }, "full phone number"],
  ["BREAK: HTML in the first name", { ...good, firstName: "<b>Alex</b>" }, "could carry HTML"],
  ["BREAK: template tags in the first name", { ...good, firstName: "{{ params.setupUrl }}" }, "template tags"],
  ["BREAK: a number instead of text", { ...good, maskedUsername: 12345 }, "must be text"],
  ["BREAK: params over 100 KB", { ...good, firstName: "A".repeat(110 * 1024) }, "Brevo allows up to 100 KB"],
];

let failed = 0;
for (const [name, params, expected] of cases) {
  const { errors } = checkParams(params, template);
  let ok;
  if (expected === "pass") ok = errors.length === 0;
  else ok = errors.some((e) => e.includes(expected));
  if (!ok) failed++;
  const result = expected === "pass" ? (errors.length ? "FAILED (should pass)" : "passed") : ok ? "caught" : "MISSED";
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(46)} ${result}`);
  if (!ok) console.log("      got: " + JSON.stringify(errors));
}
console.log(`\n${cases.length - failed} of ${cases.length} behave as expected.`);
process.exit(failed ? 1 : 0);