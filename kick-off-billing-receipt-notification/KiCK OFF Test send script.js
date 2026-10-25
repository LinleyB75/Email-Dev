// Sends the account setup email through Brevo, using a template ID and the JSON params.
//   npm run send:dry   shows the request, sends nothing
//   npm run send       sends data/params.json to TEST_TO_EMAIL
require("dotenv").config();
const fs = require("fs");

const dryRun = process.argv.includes("--dry-run");
const params = JSON.parse(fs.readFileSync("data/params.json", "utf8"));

const body = {
  to: [{ email: process.env.TEST_TO_EMAIL || "you@example.com", name: params.firstName }],
  templateId: Number(process.env.BREVO_TEMPLATE_ID || 1),
  params,
};

if (dryRun) {
  console.log("DRY RUN. Nothing sent. This is the request to https://api.brevo.com/v3/smtp/email:\n");
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

if (!process.env.BREVO_API_KEY || !process.env.BREVO_TEMPLATE_ID || !process.env.TEST_TO_EMAIL) {
  console.error("Fill in BREVO_API_KEY, BREVO_TEMPLATE_ID and TEST_TO_EMAIL in .env");
  process.exit(1);
}

fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: { accept: "application/json", "content-type": "application/json", "api-key": process.env.BREVO_API_KEY },
  body: JSON.stringify(body),
})
  .then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Brevo said no. Status " + res.status + ":", data);
      process.exit(1);
    }
    console.log("Sent. Brevo messageId:", data.messageId);
  })
  .catch((err) => {
    console.error("Request failed:", err.message);
    process.exit(1);
  });