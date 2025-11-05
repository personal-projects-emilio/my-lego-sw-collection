import dotenv from 'dotenv'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = join(__dirname, '../.env')
if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const BASE_URL = process.env.VITE_BASE_URL || '/my-lego-sw-collection'
const filePath = join(__dirname, '../dist/404.html')

if (!existsSync(filePath)) {
  console.error('Error: dist/404.html not found. Make sure to run build first.')
  process.exit(1)
}

let html = readFileSync(filePath, 'utf8')
html = html.replace(/__BASE_URL__/g, BASE_URL)
writeFileSync(filePath, html)

console.log(`✓ Replaced __BASE_URL__ with '${BASE_URL}' in dist/404.html`)
