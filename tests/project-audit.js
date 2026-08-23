const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = path.resolve(__dirname, "..");
const front = path.join(root, "frontend");
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(path.join(dir, entry.name))
      : [path.join(dir, entry.name)],
  );
}

// JavaScript syntax
const jsFiles = walk(root).filter(
  (file) => file.endsWith(".js") && !file.includes(`${path.sep}node_modules${path.sep}`),
);
for (const file of jsFiles) {
  const result = cp.spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failures.push(`JS syntax: ${path.relative(root, file)}\n${result.stderr}`);
  }
}

// HTML structure + local references + duplicate IDs
const htmlFiles = walk(front).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, "utf8");
  const lower = text.toLowerCase();

  const htmlCloseCount = (lower.match(/<\/html\s*>/g) || []).length;
  if (htmlCloseCount !== 1) {
    failures.push(`HTML close count (${htmlCloseCount}): ${path.relative(root, file)}`);
  }

  const finalClose = lower.lastIndexOf("</html>");
  if (finalClose >= 0 && text.slice(finalClose + 7).trim()) {
    failures.push(`Content after </html>: ${path.relative(root, file)}`);
  }

  const ids = [...text.matchAll(/\bid\s*=\s*"([^"]+)"/gi)].map((match) => match[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) failures.push(`Duplicate HTML id '${id}': ${path.relative(root, file)}`);
    seen.add(id);
  }

  const refRegex = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = refRegex.exec(text))) {
    const raw = match[1];
    if (raw !== raw.trim()) {
      failures.push(`Whitespace in local ref: ${path.relative(root, file)} -> ${JSON.stringify(raw)}`);
      continue;
    }

    const value = raw.split(/[?#]/)[0];
    if (!value || /^(https?:|mailto:|tel:|data:|javascript:|#)/.test(value)) continue;

    let target;
    if (value === "/") target = path.join(front, "index.html");
    else if (value.startsWith("/")) target = path.join(front, value.slice(1));
    else target = path.resolve(path.dirname(file), value);

    if (!fs.existsSync(target)) {
      failures.push(`Broken local ref: ${path.relative(root, file)} -> ${raw}`);
    }
  }
}

// Required files
const requiredFiles = [
  "backend/src/app.js",
  "database/schema.sql",
  "database/migrations/009_product_variants.sql",
  "frontend/index.html",
  "frontend/pages/admin/dashboard.html",
  "frontend/pages/seller/dashboard.html",
  "frontend/pages/buyer/dashboard.html",
];
for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`);
}

// Canonical schema coverage
const schema = fs.readFileSync(path.join(root, "database/schema.sql"), "utf8");
for (const table of [
  "users",
  "centers",
  "center_requests",
  "products",
  "product_variants",
  "orders",
  "order_items",
  "buyer_profiles",
  "carts",
  "cart_items",
  "wishlist_items",
  "reports",
  "notifications",
  "password_reset_tokens",
]) {
  if (!new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`, "i").test(schema)) {
    failures.push(`Schema missing table: ${table}`);
  }
}
for (const schemaToken of [
  "variant_id BIGINT UNSIGNED",
  "selected_color VARCHAR(80)",
  "selected_size VARCHAR(50)",
  "idx_cart_product_variant",
]) {
  if (!schema.includes(schemaToken)) failures.push(`Schema missing variant integration: ${schemaToken}`);
}
if (/UNIQUE KEY\s+uk_cart_product\s*\(cart_id,product_id\)/i.test(schema)) {
  failures.push("Schema still has legacy uk_cart_product unique index that blocks multiple variants in one cart.");
}

// Route family mounts
const app = fs.readFileSync(path.join(root, "backend/src/app.js"), "utf8");
for (const mount of ["/api/auth", "/api/marketplace", "/api/admin", "/api/seller", "/api/buyer"]) {
  if (!app.includes(mount)) failures.push(`App missing route family: ${mount}`);
}

console.log(`Checked ${jsFiles.length} JavaScript files and ${htmlFiles.length} HTML files.`);
if (failures.length) {
  console.error(`AUDIT FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("✅ Krest Center static integration audit passed.");
