// Tests send.js against a small simulated Brevo server on your own computer. Nothing real is called.
//   npm run test:send
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const GOOD_KEY = "xkeysib-TESTKEY-not-real-0123456789abcdef";
const received = [];

const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    const key = req.headers["api-key"];
    received.push({ url: req.url, method: req.method, headers: req.headers, body: raw ? JSON.parse(raw) : null });
    if (key === "bad-key") { res.writeHead(401, { "content-type": "application/json" }); return res.end(JSON.stringify({ code: "unauthorized", message: "Key not found" })); }
    res.writeHead(201, { "content-type": "application/json" });
    res.end(JSON.stringify({ messageId: "<test-message-id@smtp-relay.example>" }));
  });
});

function run(args, env, input) {
  // spawn (not spawnSync), so this process stays free to answer the simulated server
  return new Promise((resolve) => {
    received.length = 0;
    const child = spawn("node", ["send.js", ...args], { env: { PATH: process.env.PATH, ENV_FILE: "/nonexistent-env-file", ...env } });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => setTimeout(() => resolve({ code, out, requests: [...received] }), 50));
    child.stdin.write(input || "");
    child.stdin.end();
  });
}

server.listen(0, async () => {
  const port = server.address().port;
  const base = { BREVO_BASE_URL: `http://127.0.0.1:${port}`, BREVO_API_KEY: GOOD_KEY, BREVO_TEMPLATE_ID: "12", TEST_TO_EMAIL: "tester@example.com" };
  const tmp = path.join(os.tmpdir(), "bad-params.json");
  fs.writeFileSync(tmp, JSON.stringify({ firstName: "Alex", maskedUsername: "a******e", setupUrl: "http://not-secure.example.com/x" }));

  let failed = 0;
  const t = (name, ok, detail) => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "\n      " + detail}`); };
  const r = run;

  let x = await r([], base);
  t("dry run (the default): exits 0, says nothing was sent, makes no request", x.code === 0 && /DRY RUN/.test(x.out) && x.requests.length === 0, x.out);
  t("dry run: the API key is never printed, and the address is masked", !x.out.includes(GOOD_KEY) && x.out.includes("t***@example.com") && !x.out.includes("tester@"), x.out);

  x = await r(["--sandbox"], base);
  const q = x.requests[0];
  t("sandbox: one request to /v3/smtp/email", x.code === 0 && x.requests.length === 1 && q.url === "/v3/smtp/email" && q.method === "POST", x.out);
  t("sandbox: the flag is in the JSON body's headers, NOT an HTTP header", q && q.body.headers && q.body.headers["X-Sib-Sandbox"] === "drop" && !q.headers["x-sib-sandbox"], JSON.stringify(q && q.body));
  t("sandbox: api-key header, template ID as a number, recipient and params are right", q && q.headers["api-key"] === GOOD_KEY && q.body.templateId === 12 && q.body.to[0].email === "tester@example.com" && q.body.params.setupUrl.startsWith("https://"), JSON.stringify(q && q.body));
  t("sandbox: says no email was sent, and the key is not printed", /No email was sent/.test(x.out) && !x.out.includes(GOOD_KEY), x.out);

  x = await r(["--live"], base, "no\n");
  t("live: typing anything but SEND cancels, and nothing is sent", x.code === 1 && x.requests.length === 0 && /Cancelled/.test(x.out), x.out);
  x = await r(["--live"], base, "");
  t("live: closing the prompt without answering cancels", x.code === 1 && x.requests.length === 0, x.out);
  x = await r(["--live"], base, "SEND\n");
  t("live: typing SEND sends exactly one request, with no sandbox flag", x.code === 0 && x.requests.length === 1 && !x.requests[0].body.headers, x.out);
  t("live: prints the messageId and warns that accepted is not delivered", /messageId: <test-message-id@smtp-relay.example>/.test(x.out) && /not the same as delivered/.test(x.out) && !x.out.includes(GOOD_KEY), x.out);

  x = await r([tmp, "--sandbox"], base);
  t("bad params (http link): refuses before any request", x.code === 1 && x.requests.length === 0 && /NOT SENDING/.test(x.out) && /https:\/\//.test(x.out), x.out);

  x = await r(["--sandbox"], { ...base, BREVO_API_KEY: "bad-key" });
  t("Brevo says 401: shows the status and message, exits 1, never prints the key", x.code === 1 && /Status 401/.test(x.out) && /Key not found/.test(x.out) && !x.out.includes("bad-key"), x.out);

  x = await r(["--sandbox"], { ...base, BREVO_API_KEY: "" });
  t("missing API key: stops with a clear message, no request", x.code === 1 && x.requests.length === 0 && /Fill in BREVO_API_KEY/.test(x.out), x.out);
  x = await r(["--sandbox"], { ...base, BREVO_TEMPLATE_ID: "abc" });
  t("template ID that is not a number: stops, no request", x.code === 1 && x.requests.length === 0 && /whole number/.test(x.out), x.out);
  x = await r(["--sandbox"], { ...base, BREVO_API_KEY: "xsmtpsib-looks-like-an-smtp-key-0123456789" });
  t("an SMTP-style key gets a warning", /SMTP key/.test(x.out), x.out);

  console.log(failed ? `\n${failed} test(s) failed.` : "\nAll send.js tests passed (against a simulated Brevo server, nothing real was called).");
  server.close();
  process.exit(failed ? 1 : 0);
});