import path from "path";
import { writeFileSync } from "fs";
import shell from "shelljs";
import generateEnvFile from "./generateEnvFile.js";
import generatePrismaSchema from "./generatePrismaSchema.js";
import generateRouterFile from "./generateRouterFile.js";
import generateServerFile from "./generateServerFile.js";
import generateJestTests from "./generateJestTests.js";
import generateReactApp from "./generateReactApp.js";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateProject(projectPath, options) {
  console.log(`Creating Node.js project at ${projectPath}...`);

  const apiFolderPath = path.join(projectPath, "api");
  if (shell.mkdir("-p", apiFolderPath).code !== 0) {
    console.error(`${RED}Error creating the "api" folder.${RESET}`);
    process.exit(1);
  }

  // Generate .gitignore file
  const gitignoreContent = `node_modules`;
  const gitignorePath = path.join(apiFolderPath, ".gitignore");
  writeFileSync(gitignorePath, gitignoreContent);
  console.log(`${GREEN}.gitignore file generated.${RESET}`);

  generateEnvFile(apiFolderPath);
  generatePrismaSchema(apiFolderPath);
  generateRouterFile(apiFolderPath);
  generateServerFile(apiFolderPath);
  if (options.useTDD) {
    generateJestTests(apiFolderPath);
  }
  generateReactApp(projectPath);
  console.log(`Project created at ${projectPath}.`);
}
