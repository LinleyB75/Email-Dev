// Compiles the MJML template to HTML. The Brevo tags ({{ params.x }}, {% if %}, {% for %})
// stay in the output, so the file can be uploaded to Brevo as it is.
const fs = require("fs");
const path = require("path");
const mjml = require("mjml");

(async () => {
  const src = fs.readFileSync(path.join(__dirname, "templates", "account-setup.mjml"), "utf8");
  const { html, errors } = await mjml(src, { validationLevel: "strict" });
  if (errors.length) {
    console.error(errors);
    process.exit(1);
  }
  fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
  const out = path.join(__dirname, "dist", "account-setup.html");
  fs.writeFileSync(out, html);
  console.log(`Built ${path.relative(process.cwd(), out)} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});