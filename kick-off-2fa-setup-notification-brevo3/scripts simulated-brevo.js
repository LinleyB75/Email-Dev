// A SIMULATED Brevo that runs on your own computer. It follows Brevo's documented API behaviour, so the
// scripts and the email can be tested from start to finish without calling Brevo.
// It is not Brevo. It does not show how real Brevo treats your HTML, special characters or its editor,
// and its error messages are not Brevo's. The same walkthrough runs against real Brevo: npm run test:brevo
//
// Behaviour taken from Brevo's API documentation:
//   - requests carry an api-key header; a send returns 201 and a messageId
//   - a template must exist and be activated; its sender and subject apply unless the request overrides them
//   - the sandbox flag goes in the JSON body's "headers": no email is sent and no log is made
//   - one params object can be up to 100 KB, and one request can have up to 2000 recipients
//   - the log needs one of: email, templateId or messageId
//   - a template needs a sender and a subject
const http = require("http");
const fs = require("fs");
const path = require("path");
const nunjucks = require("nunjucks");

const MAX_PARAMS_BYTES = 100 * 1024;
const MAX_RECIPIENTS = 2000;

function inboxReport(html, params) {
  const esc = (s) => String(s).replace(/&/g, "&amp;");
  const hrefs = [...html.matchAll(/<a [^>]*href="([^"]*)"/g)].map((m) => m[1]);
  const text = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
  const checks = [
    ["No template tags left over", !/\{\{|\{%/.test(html)],
    ["The greeting is filled in", /Hi (there|[A-Za-z][^,<]{0,40}),/.test(text)],
    ["The masked username shows", params.maskedUsername ? html.includes(esc(params.maskedUsername)) : false],
    ["The button points at the set-up link", params.setupUrl ? hrefs.includes(esc(params.setupUrl)) : false],
    ["No empty links", !hrefs.some((h) => h.trim() === "")],
    ["Icons and logos are real addresses", !html.includes("REPLACE-WITH-YOUR-HOST")],
    ["No link still points at example.com", !hrefs.some((h) => /^https?:\/\/(www\.)?example\.com/.test(h))],
  ];
  return checks.map(([label, ok]) => ({ label, ok }));
}

function startSimulatedBrevo({ port = 0, apiKey = "xkeysib-SIMULATED-not-a-real-key", outDir = "simulated-inbox" } = {}) {
  const templates = new Map();
  const messages = [];
  let nextTemplateId = 1;
  const env = new nunjucks.Environment(null, { autoescape: true });
  fs.mkdirSync(outDir, { recursive: true });

  const send = (res, status, obj) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
  const stamp = () => new Date().toISOString().replace(/\D/g, "").slice(0, 14);

  // An inbox page listing every message that was "sent", like a mail client's list
  function writeIndex() {
    const rows = messages.map((m) => `<tr><td>${m.n}</td><td>${m.from.email}</td><td>${m.to}</td><td>${m.subject}</td><td><a href="message-${m.n}.html">open</a></td></tr>`).join("\n");
    fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html><meta charset="utf-8"><title>Simulated inbox</title><style>body{font-family:Arial,sans-serif;margin:24px}td,th{padding:6px 12px;border-bottom:1px solid #ccc;text-align:left}</style><h1>Simulated inbox</h1><p>Messages from the simulated Brevo. Not a real mailbox.</p><table><tr><th>#</th><th>From</th><th>To</th><th>Subject</th><th></th></tr>\n${rows}\n</table>`);
  }

  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      if (req.headers["api-key"] !== apiKey) return send(res, 401, { code: "unauthorized", message: "Key not found" });
      let body = {};
      try { body = raw ? JSON.parse(raw) : {}; } catch { return send(res, 400, { code: "invalid_parameter", message: "Invalid JSON" }); }
      const [url, query = ""] = req.url.split("?");
      const q = new URLSearchParams(query);

      // Create a template (New Template, then your own HTML)
      if (req.method === "POST" && url === "/v3/smtp/templates") {
        if (!body.sender || !body.subject) return send(res, 400, { code: "missing_parameter", message: "sender and subject are required" });
        const id = nextTemplateId++;
        // Created inactive. Save and Activate (or isActive: true) switches it on
        templates.set(id, { id, name: body.templateName || "Untitled", subject: body.subject, sender: body.sender, html: body.htmlContent || "", isActive: body.isActive === true });
        return send(res, 201, { id });
      }
      // Save and Activate
      const put = url.match(/^\/v3\/smtp\/templates\/(\d+)$/);
      if (req.method === "PUT" && put) {
        const t = templates.get(Number(put[1]));
        if (!t) return send(res, 404, { code: "document_not_found", message: "Template not found" });
        if (typeof body.isActive === "boolean") t.isActive = body.isActive;
        res.writeHead(204); return res.end();
      }
      // Send a transactional email
      if (req.method === "POST" && url === "/v3/smtp/email") {
        const to = Array.isArray(body.to) ? body.to : [];
        if (!to.length || !to.every((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email || ""))) return send(res, 400, { code: "invalid_parameter", message: "to must be a list of valid email addresses" });
        if (to.length > MAX_RECIPIENTS) return send(res, 400, { code: "invalid_parameter", message: `A request can have up to ${MAX_RECIPIENTS} recipients` });
        const t = templates.get(Number(body.templateId));
        if (!t || !t.isActive) return send(res, 400, { code: "invalid_parameter", message: `Template ${body.templateId} was not found or is not activated` });
        const params = body.params || {};
        if (Buffer.byteLength(JSON.stringify(params)) > MAX_PARAMS_BYTES) return send(res, 400, { code: "invalid_parameter", message: "params must not exceed 100 KB" });
        const n = messages.length + 1;
        const messageId = `<${stamp()}.${n}.${Math.random().toString(36).slice(2, 10)}@smtp-relay.simulated>`;
        // The sandbox flag lives in the JSON body's headers object: no email, no log
        if (body.headers && body.headers["X-Sib-Sandbox"] === "drop") return send(res, 201, { messageId });
        // The template's sender and subject apply unless the request overrides them
        const from = body.sender || t.sender;
        const subject = body.subject || t.subject;
        const html = env.renderString(t.html, { params });
        const file = path.join(outDir, `message-${n}.html`);
        fs.writeFileSync(file, html);
        const report = inboxReport(html, params);
        messages.push({ n, messageId, to: to[0].email, from, subject, templateId: t.id, date: new Date().toISOString(), file, report });
        fs.writeFileSync(path.join(outDir, `message-${n}.json`), JSON.stringify({ messageId, from, to: to[0].email, subject, templateId: t.id, report }, null, 2));
        writeIndex();
        return send(res, 201, { messageId });
      }
      // The transactional log: needs one of email, templateId or messageId
      if (req.method === "GET" && url === "/v3/smtp/emails") {
        if (!q.get("email") && !q.get("templateId") && !q.get("messageId")) return send(res, 400, { code: "missing_parameter", message: "Pass one of email, templateId or messageId" });
        const found = messages.filter((m) => (!q.get("email") || m.to === q.get("email")) && (!q.get("templateId") || String(m.templateId) === q.get("templateId")) && (!q.get("messageId") || m.messageId === q.get("messageId")));
        return send(res, 200, { count: found.length, transactionalEmails: found.map(({ messageId, to, subject, templateId, date }) => ({ messageId, email: to, subject, templateId, date })) });
      }
      send(res, 404, { code: "not_found", message: "Not part of the simulated Brevo" });
    });
  });

  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, port: server.address().port, apiKey, templates, messages, close: () => new Promise((r) => server.close(r)) })));
}

module.exports = { startSimulatedBrevo, inboxReport };

if (require.main === module) {
  startSimulatedBrevo({ port: 4010 }).then((b) => console.log(`Simulated Brevo running at http://127.0.0.1:${b.port}  (API key: ${b.apiKey})\nIt is not real Brevo. Press Ctrl+C to stop.`));
}