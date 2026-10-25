// Checks the params against the contract in the README before anything is sent to Brevo.
// Returns an array of error messages. An empty array means the params are valid.
function validateParams(p) {
  const errors = [];
  const isText = (v) => typeof v === "string" && v.trim() !== "";

  if (!p || typeof p !== "object" || Array.isArray(p)) return ["params must be an object"];

  if (!isText(p.setupLink)) errors.push("setupLink is required (text)");
  else if (!/^https:\/\//i.test(p.setupLink)) errors.push("setupLink must start with https://");

  if (!isText(p.maskedEmail)) errors.push("maskedEmail is required (text)");

  if (p.firstName !== undefined && typeof p.firstName !== "string") errors.push("firstName must be text");

  if (p.linkExpiresInHours !== undefined && (typeof p.linkExpiresInHours !== "number" || !(p.linkExpiresInHours > 0))) {
    errors.push("linkExpiresInHours must be a number greater than 0 (leave it out to hide the line)");
  }

  if (p.plan !== undefined && (typeof p.plan !== "object" || p.plan === null || Array.isArray(p.plan))) {
    errors.push("plan must be an object");
  }

  if (p.classes !== undefined) {
    if (!Array.isArray(p.classes)) errors.push("classes must be an array");
    else if (p.classes.length === 0) errors.push("classes must not be empty (leave the key out instead)");
    else {
      if (p.plan === undefined) errors.push("classes are only shown when plan is also sent");
      p.classes.forEach((c, i) => {
        ["day", "time", "teacher"].forEach((k) => {
          if (!isText(c && c[k])) errors.push(`classes[${i}].${k} is required (text)`);
        });
      });
    }
  }
  return errors;
}

module.exports = { validateParams };