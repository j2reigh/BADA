import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // Build Vercel serverless handler (pre-bundled)
  // This solves ERR_MODULE_NOT_FOUND issues with ESM imports at runtime
  console.log("building vercel handler...");
  await esbuild({
    entryPoints: ["server/vercel_entry.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "api/index.js",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.VERCEL": '"1"',
    },
    banner: {
      js: [
        'import { createRequire } from "module";',
        'const require = createRequire(import.meta.url);',
      ].join("\\n"),
    },
    minify: true,
    external: [], // bundle everything for Vercel (except native modules if any)
    logLevel: "info",
  });


  // Build Vercel serverless handler
  console.log("building vercel handler...");
  await esbuild({
    entryPoints: ["server/vercel_entry.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "api/index.js",
    sourcemap: true,
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.VERCEL": '"1"',
    },
    banner: {
      js: [
        'import { createRequire } from "module";',
        'const require = createRequire(import.meta.url);',
      ].join("\\n"),
    },
    minify: false,
    external: allDeps,
    logLevel: "info",
  });

}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
