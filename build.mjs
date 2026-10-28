import * as esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve @earendil-works/pi-ai/dist/* by pointing directly at the filesystem,
// bypassing package.json exports. Same approach pi's own bundler uses.
const piAiDist = resolve(__dirname, "node_modules/@earendil-works/pi-ai/dist");

const piAiInternalPlugin = {
  name: "pi-ai-internal",
  setup(build) {
    build.onResolve({ filter: /^@earendil-works\/pi-ai\/dist\// }, (args) => {
      const relativePath = args.path.replace("@earendil-works/pi-ai/dist/", "");
      return { path: resolve(piAiDist, relativePath) };
    });
  },
};

await esbuild.build({
  entryPoints: ["index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/index.js",
  external: [
    "@earendil-works/pi-ai/compat",
    "@earendil-works/pi-ai/models",
    "@earendil-works/pi-ai/providers/*",
    "@earendil-works/pi-coding-agent",
  ],
  plugins: [piAiInternalPlugin],
});

console.log("Build OK → dist/index.js");
