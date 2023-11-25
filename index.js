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
      type: "list",
      name: "frontendFramework",
      message: "Select the project type:",
      choices: ["Vite", "React"],
    },
    {
      type: "confirm",
      name: "backendTesting",
      message: "Do you want tests for the backend?",
      default: true,
    },
    {
      type: "list",
      name: "backendTestingFramework",
      message: "Select testing framework for the backend:",
      when: (answers) => answers.backendTesting,
      choices: ["Jest"],
    },
    {
      type: "confirm",
      name: "frontendTesting",
      message: "Do you want tests for the frontend?",
      default: true,
    },
    {
      type: "list",
      name: "frontendTestingFramework",
      message: "Select testing framework for the frontend:",
      when: (answers) => answers.frontendTesting,
      choices: ["Vitest", "Jest"],
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
