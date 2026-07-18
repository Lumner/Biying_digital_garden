import { performance } from "node:perf_hooks";

const MIN_ITERATIONS = 100000;
const MAX_ITERATIONS = 1000000;
const TARGET_MIN_MS = 100;
const TARGET_MAX_MS = 250;
const encoder = new TextEncoder();

function integer(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

const iterations = integer(
  process.argv[2] || process.env.BIYING_PASSWORD_ITERATIONS,
  MIN_ITERATIONS
);
const runs = integer(process.argv[3], 5);

if (iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) {
  throw new Error(
    `iterations must be between ${MIN_ITERATIONS} and ${MAX_ITERATIONS}`
  );
}
if (runs < 3 || runs > 20) {
  throw new Error("runs must be between 3 and 20");
}

const salt = new Uint8Array(16);
crypto.getRandomValues(salt);
const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode("benchmark-only-password"),
  "PBKDF2",
  false,
  ["deriveBits"]
);

async function derive() {
  return crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt,
    iterations,
    hash: "SHA-256"
  }, key, 256);
}

await derive();
const timings = [];
for (let run = 0; run < runs; run += 1) {
  const startedAt = performance.now();
  await derive();
  timings.push(performance.now() - startedAt);
}

const sorted = [...timings].sort((left, right) => left - right);
const median = sorted[Math.floor(sorted.length / 2)];
const p95 = sorted[Math.min(
  sorted.length - 1,
  Math.ceil(sorted.length * 0.95) - 1
)];
const target = median >= TARGET_MIN_MS && median <= TARGET_MAX_MS;

console.log(JSON.stringify({
  iterations,
  runs,
  medianMs: Number(median.toFixed(2)),
  p95Ms: Number(p95.toFixed(2)),
  targetMedianMs: `${TARGET_MIN_MS}-${TARGET_MAX_MS}`,
  withinTarget: target,
  note: "Run in the EdgeOne preview runtime before changing production iterations."
}, null, 2));
