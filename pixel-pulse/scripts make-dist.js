// Runs before "npm run build". Git does not keep empty folders, so a fresh copy of the project has no
// dist folder. This makes sure it exists.
require("fs").mkdirSync("dist", { recursive: true });