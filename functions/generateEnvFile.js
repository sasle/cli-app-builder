import path from "path";
import { writeFileSync } from "fs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateEnvFile(apiFolderPath) {
  const envContent = `DATABASE_URL="file:./dev.db"`;
  const envFilePath = path.join(apiFolderPath, ".env");
  writeFileSync(envFilePath, envContent);
  console.log(`${GREEN}Generated .env file.${RESET}`);
}
