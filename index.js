import inquirer from "inquirer";
import shell from "shelljs";
import path from "path";
import generateProject from "./functions/generateProject.js";

// Define ANSI color codes
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

process.on("SIGINT", () => {
  console.log(`${RED}Script terminated.${RESET}`);
  process.exit(1);
});

inquirer
  .prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the project name:",
    },
    {
      type: "confirm",
      name: "useTDD",
      message: "Do you want to use Test-Driven Development (TDD)?",
      default: true,
    },
  ])
  .then((answers) => {
    const projectPath = path.join(
      process.env.HOME,
      "Desktop",
      answers.projectName
    );

    if (shell.mkdir("-p", projectPath).code !== 0) {
      console.error(`${RED}Error creating the project directory.${RESET}`);
      process.exit(1);
    }

    generateProject(projectPath, answers);
  });
