import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine((str) => !str.includes('YOUR_MYSQL_URL_HERE'), 'You forgot to change the default URL'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    NEXTAUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    NEXTAUTH_URL: z.preprocess((str) => process.env.VERCEL_URL ?? str, process.env.VERCEL ? z.string() : z.string().url()),

    NODEMAILER_EMAIL: z.string().email(),
    NODEMAILER_PW: z.string(),

    MQTT_BROKER_URL: z.string().url(),
    MQTT_USER_NAME: z.string(),
    MQTT_PASSWORD: z.string(),
    MQTT_PORT: z.coerce.number()
  },

  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
    NODEMAILER_PW: process.env.NODEMAILER_PW,
    MQTT_BROKER_URL: process.env.MQTT_BROKER_URL,
    MQTT_USER_NAME: process.env.MQTT_USER_NAME,
    MQTT_PASSWORD: process.env.MQTT_PASSWORD,
    MQTT_PORT: process.env.MQTT_PORT
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
