const { z } = require('zod');
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional(),
  OLLAMA_URL: z.string().url().default('http://localhost:11434'),
  NODE_ENV: z.enum(['development','test','production']).default('development'),
});
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Env validation failed:', parsed.error.flatten().fieldErrors);
    if (process.env.NODE_ENV !== 'test') process.exit(1);
  }
  return parsed.data || process.env;
}
module.exports = validateEnv;
