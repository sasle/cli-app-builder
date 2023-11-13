import path from "path";
import shell from "shelljs";
import { writeFileSync, readFileSync } from "fs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateFrontendTests(framework, projectPath) {
  console.log(`Generating ${framework} tests for the frontend...`);
  if (framework === "Vitest") {
    shell.exec("npm install -D vitest@latest", {
      stdio: "inherit",
      silent: true,
    });

    // Create a simple vitest test for App.tsx
    const testContents = `
    import { expect, test } from "vitest";

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});

function sum(a, b) {
  return a + b;
}
  `;

    // Create a folder for tests if it doesn't exist
    if (!shell.test("-d", "__tests__")) {
      shell.mkdir("__tests__");
    }

    shell.ShellString(testContents).to("__tests__/basic.test.ts");

    // Path to your project's package.json file
    const packageJsonPath = path.join(projectPath, "client/package.json");

    // Read the existing package.json file
    const packageJsonContent = JSON.parse(
      readFileSync(packageJsonPath, "utf-8")
    );

    // Add the "test" script if it doesn't exist, or update its value to "vitest"
    packageJsonContent.scripts = {
      ...packageJsonContent.scripts,
      test: "vitest",
    };

    // Write the modified package.json back to the file
    writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

    console.log(`${GREEN}Configured Vitest for the frontend.${RESET}`);
  } else {
    shell.exec("npm install @types/jest@latest ts-jest@latest jest@latest", {
      stdio: "inherit",
      silent: true,
    });

    // Create a basic Jest test file
    const testContents = `
      test('adds 1 + 2 to equal 3', () => {
        expect(sum(1, 2)).toBe(3);
      });

      function sum(a, b) {
        return a + b;
      }
    `;

    // Create a folder for tests if it doesn't exist
    if (!shell.test("-d", "__tests__")) {
      shell.mkdir("__tests__");
    }

    // Save the basic Jest test file
    shell.ShellString(testContents).to("__tests__/basic.test.ts");

    // Update the "test" script in package.json
    const packageJsonPath = path.join(projectPath, "client/package.json");
    const packageJsonContent = JSON.parse(
      readFileSync(packageJsonPath, "utf-8")
    );

    packageJsonContent.scripts = {
      ...packageJsonContent.scripts,
      test: "jest",
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

    console.log(`${GREEN}Configured Jest for the frontend.${RESET}`);
  }
}
