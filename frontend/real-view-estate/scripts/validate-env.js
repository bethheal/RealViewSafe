const required = [
  "VITE_API_URL",
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`Missing required VITE env vars: ${missing.join(", ")}`);
  if (process.env.NODE_ENV === "production") process.exit(1);
}

console.log("Frontend env validation passed");
