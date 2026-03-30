import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

// Load DATABASE_URL from .env.local since drizzle-kit doesn't read it by default
function loadEnvLocal(): string {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/^DATABASE_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  return process.env.DATABASE_URL ?? '';
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: loadEnvLocal(),
  },
});
