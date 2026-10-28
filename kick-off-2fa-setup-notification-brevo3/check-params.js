// Checks the example params against the MJML, and refuses anything that must never be in a
// two-factor email (a code, a setup key, a QR link, a full phone number, an unmasked email).
//   npm run check-params                  checks data/params.json
//   node check-params.js some-file.json   checks another file
const fs = require("fs");

const TEMPLATE = "templates/2fa-setup-notification.mjml";
const MAX_PARAMS_BYTES = 100 * 1024; // Brevo: one params object must not exceed 100 KB

// What the template reads. Names used inside {% if params.x %} are optional, the rest are required.
function readTemplate(text) {
  const used = new Set([...text.matchAll(/params\.([A-Za-z_]\w*)/g)].map((m) => m[1]));
  const optional = new Set([...text.matchAll(/\{%\s*if\s+params\.([A-Za-z_]\w*)/g)].map((m) => m[1]));
  const required = [...used].filter((n) => !optional.has(n));
  return { used, optional, required };
}

// Rules for text values (not for the setup link, whose token can contain any characters)
const TEXT_RULES = [
  [/otpauth:\/\//i, "looks like a QR or authenticator link (otpauth://). This email must never carry one"],
  [/(?<![\d*])\d{6,8}(?![\d*])/, "contains a 6 to 8 digit number, which could be a verification code"],
  [/\b[A-Z2-7]{16,}\b/, "contains a long setup-key style string (A to Z and 2 to 7)"],
  [/\+?\d[\d\s().-]{7,}\d/, "contains a full phone number. Send only a masked end such as ******12"],
  [/[^\s@*]+@[^\s@]+\.[^\s@]+/, "contains an email address that is not masked"],
  [/[<>]/, "contains < or >, so it could carry HTML"],
  [/\{\{|\{%/, "contains template tags, so it could change the email"],
];

function checkParams(params, templateText) {
  const errors = [];
  const notes = [];
  const { used, optional, required } = readTemplate(templateText);

  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return { errors: ["The params must be one JSON object"], notes };
  }

  // 1. Names: everything the template reads must be sent
  for (const name of required) {
    const v = params[name];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      errors.push(`"${name}" is required but missing or empty (the template reads params.${name})`);
    }
  }
  for (const key of Object.keys(params)) {
    if (!used.has(key)) notes.push(`"${key}" is sent but the template never reads it (misspelt, or not needed)`);
  }

  // 2. Every value must be text
  for (const [key, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && typeof v !== "string") errors.push(`"${key}" must be text, not ${Array.isArray(v) ? "a list" : typeof v}`);
  }

  // 3. Rules for the setup link
  const link = params.setupUrl;
  if (typeof link === "string" && link.trim() !== "") {
    if (!/^https:\/\//i.test(link)) errors.push('"setupUrl" must start with https://');
    if (/\s/.test(link)) errors.push('"setupUrl" must not contain spaces');
    if (/otpauth|secret=|seed=/i.test(link)) errors.push('"setupUrl" must not carry a secret, seed or authenticator link');
    if (link.length > 2000) errors.push('"setupUrl" is longer than 2000 characters');
  }

  // 4. Rules for the masked username
  const user = params.maskedUsername;
  if (typeof user === "string" && user.trim() !== "") {
    if (!user.includes("*")) errors.push('"maskedUsername" is not masked. Send it with * characters, for example a******e');
    if (user.length > 40) errors.push('"maskedUsername" is longer than 40 characters');
  }

  // 5. Rules for the first name
  const name = params.firstName;
  if (typeof name === "string" && name.length > 50) errors.push('"firstName" is longer than 50 characters');

  // 6. Safety rules on every text value except the setup link
  for (const [key, v] of Object.entries(params)) {
    if (typeof v !== "string" || key === "setupUrl") continue;
    for (const [rule, why] of TEXT_RULES) {
      if (rule.test(v)) errors.push(`"${key}" ${why}`);
    }
  }

  // 7. Size
  const bytes = Buffer.byteLength(JSON.stringify(params));
  if (bytes > MAX_PARAMS_BYTES) errors.push(`The params are ${Math.round(bytes / 1024)} KB. Brevo allows up to 100 KB`);

  return { errors, notes, required: required, optional: [...optional] };
}

module.exports = { checkParams, readTemplate };

if (require.main === module) {
  const file = process.argv[2] || "data/params.json";
  const params = JSON.parse(fs.readFileSync(file, "utf8"));
  const template = fs.readFileSync(TEMPLATE, "utf8");
  const r = checkParams(params, template);

  console.log(`Checked ${file} against ${TEMPLATE}`);
  console.log(`  required: ${r.required.join(", ") || "none"}`);
  console.log(`  optional: ${r.optional.join(", ") || "none"}`);
  if (r.notes.length) {
    console.log("\nNOTES:");
    r.notes.forEach((n) => console.log("  - " + n));
  }
  if (r.errors.length) {
    console.log("\nPROBLEMS:");
    r.errors.forEach((e) => console.log("  - " + e));
    process.exit(1);
  }
  console.log("\nOK: the names match and the values pass the safety rules.");
}