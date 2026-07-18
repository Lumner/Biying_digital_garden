import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwrightCli = require.resolve("@playwright/test/cli");
const env = { ...process.env };

if (process.platform === "win32") {
  env.MOZ_DISABLE_CONTENT_SANDBOX = "1";
  env.MOZ_DISABLE_GMP_SANDBOX = "1";
}

const child = spawn(
  process.execPath,
  [
    playwrightCli,
    "test",
    "--project=desktop-firefox",
    ...process.argv.slice(2)
  ],
  {
    env,
    stdio: "inherit",
    windowsHide: true
  }
);

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Firefox tests stopped by signal ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
