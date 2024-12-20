import * as esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  platform: "node",
  target: ["node21"],
  sourcemap: true,
  loader: {
    ".node": "copy",
  },
  external: ["sqlite3"],
  // disable direct-eval warning
  logLevel: "silent",
});
