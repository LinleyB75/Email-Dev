// Checks the params for the payment receipt email.   npm run check-params
// Part 1: the template and the client's JSON agree on names (catches a misspelt name early).
// Part 2: the values follow the rules for this email, including a safety check for card data.
// data/params.json is the example JSON the client sends. Replace it with theirs.
const fs = require("fs");

const template = fs.readFileSync("templates/payment-receipt.mjml", "utf8");
const params = JSON.parse(fs.readFileSync("data/params.json", "utf8"));

// ---------- Part 1: names ----------
const used = new Set();
for (const m of template.matchAll(/params\.([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)/g)) used.add(m[1]);
// Inside a loop the fields come from the loop name: {% for item in params.lineItems %} ... {{ item.amount }}
const loops = {};
for (const m of template.matchAll(/\{%\s*for\s+(\w+)\s+in\s+params\.([\w.]+)\s*%\}/g)) loops[m[1]] = m[2];
for (const m of template.matchAll(/\{\{\s*(\w+)\.(\w+)\s*\}\}/g)) {
  if (loops[m[1]]) used.add(`${loops[m[1]]}[].${m[2]}`);
}
// Loops over a list of plain text (like billingAddressLines) read the loop name itself: {{ line }}
const given = new Set();
(function walk(value, prefix) {
  if (Array.isArray(value)) value.forEach((item) => item && typeof item === "object" && walk(item, prefix + "[]"));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) { const p = prefix ? `${prefix}.${k}` : k; given.add(p); walk(v, p); }
  }
})(params, "");
const missing = [...used].filter((p) => !given.has(p));
const unused = [...given].filter((p) => !used.has(p));

// ---------- Part 2: values ----------
const problems = [];
const isText = (v) => typeof v === "string" && v.trim() !== "";
for (const k of ["customerName", "receiptNumber", "invoiceDate", "paymentDate", "planSummary", "total", "cardBrand", "cardEnding"]) {
  if (!isText(params[k])) problems.push(`${k} is required (text)`);
}
if (!Array.isArray(params.lineItems) || params.lineItems.length === 0) problems.push("lineItems must be a list with at least one item");
else params.lineItems.forEach((it, i) => ["description", "amount"].forEach((k) => { if (!isText(it && it[k])) problems.push(`lineItems[${i}].${k} is required (text)`); }));
if (params.billingPeriod !== undefined && !isText(params.billingPeriod)) problems.push("billingPeriod must be text (leave it out to hide the line)");
if (params.billingAddressLines !== undefined && (!Array.isArray(params.billingAddressLines) || params.billingAddressLines.length === 0 || !params.billingAddressLines.every(isText))) {
  problems.push("billingAddressLines must be a list of text lines, not empty (leave it out to hide the address)");
}
// Card safety: only the last few digits may ever be sent
if (isText(params.cardEnding) && !/^[^0-9]*[0-9]{2,4}$/.test(params.cardEnding.trim())) {
  problems.push("cardEnding must end with 2 to 4 digits and nothing longer. Never send a full card number.");
}
const strings = [];
(function collect(v) { if (typeof v === "string") strings.push(v); else if (Array.isArray(v)) v.forEach(collect); else if (v && typeof v === "object") Object.values(v).forEach(collect); })(params);
if (strings.some((s) => /\b\d{13,19}\b/.test(s.replace(/[\s-]/g, "")))) problems.push("a value looks like a full card number. Remove it.");

// ---------- Report ----------
console.log(`The template reads ${used.size} params. The client's JSON has ${given.size}.`);
if (unused.length) { console.log("\nNOTE: the client's JSON has these, but the template never uses them:"); unused.forEach((p) => console.log("  - " + p)); }
if (missing.length) { console.log("\nPROBLEM: the template reads these, but the client's JSON does not have them (they would show empty):"); missing.forEach((p) => console.log("  - " + p)); }
if (problems.length) { console.log("\nPROBLEM: the values break the rules:"); problems.forEach((p) => console.log("  - " + p)); }
if (missing.length || problems.length) process.exit(1);
console.log("\nOK: the names match and the values follow the rules.");