// Runs after "npm run build". It does not stop the build. It warns about things that must be
// fixed before the template goes into Brevo.
const fs = require("fs");

const file = "dist/2fa-setup-notification.html";
const html = fs.readFileSync(file, "utf8");
const kb = Math.round(Buffer.byteLength(html) / 1024);

const warnings = [];
if (html.includes("REPLACE-WITH-YOUR-HOST")) {
  warnings.push("The social icon links still say REPLACE-WITH-YOUR-HOST. Upload the four icons and put their address in the MJML.");
}
if (/https?:\/\/(www\.)?example\.com/.test(html)) {
  warnings.push("A link still points at example.com (for example the Security and Privacy link). Put in the real address.");
}
if (/href="https:\/\/(www\.facebook|twitter|www\.instagram|www\.youtube)\.com\/"/.test(html)) {
  warnings.push("The social links go to the site home pages. Put in the client's real pages.");
}
if (kb > 90) warnings.push(`The HTML is ${kb} KB. Gmail clips emails at about 102 KB.`);

console.log(`Built ${file} (${kb} KB).`);
if (warnings.length) {
  console.log("\nBefore this goes into Brevo:");
  warnings.forEach((w) => console.log("  - " + w));
} else {
  console.log("No warnings.");
}