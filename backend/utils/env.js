const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "APP_URL",
  "PAYSTACK_SECRET_KEY",
];

export function validateEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(", ")}`;
    console.error(msg);
    // In production, fail fast
    if (process.env.NODE_ENV === "production") {
      console.error("Exiting because required env vars are missing in production.");
      process.exit(1);
    }
  }
}

export function getRequiredEnv() {
  return required;
}
