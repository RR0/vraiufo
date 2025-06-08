import {defineConfig} from "vite"
import path from "path"
import {fileURLToPath} from "url"
import packageJson from "./package.json"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __VERSION__ = packageJson.version
const nodeEnv = globalThis.process.env.NODE_ENV
const isProd = nodeEnv === "production"

export default defineConfig({
  build: {
    sourcemap: !isProd
  },
  define: {
    "import.meta.env.VERSION": JSON.stringify(__VERSION__)
  }
})
