import path from "path";
import shell from "shelljs";
import { writeFileSync } from "fs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateJestTests(apiFolderPath) {
  console.log("Generating Jest tests...");

  // Create a folder for Jest test files
  const testsFolderPath = path.join(apiFolderPath, "__tests__");

  // Create the "__tests__" folder if it doesn't exist
  if (shell.mkdir("-p", testsFolderPath).code !== 0) {
    console.error(`${RED}Error creating the Jest test folder.${RESET}`);
    return;
  }

  // Create the "setupTests.ts" file in the "__tests__" folder
  const setupTestsPath = path.join(testsFolderPath, "setupTests.ts");
  const setupTestsContents = `import { PrismaClient } from "@prisma/client";
import request from "supertest";

const app = "http://localhost:3333"; // Assuming your API is running on this URL

const prisma = new PrismaClient();

export { request, app, prisma };`;
  writeFileSync(setupTestsPath, setupTestsContents);

  // Create the "Companies" subfolder
  const companiesFolderPath = path.join(testsFolderPath, "Companies");
  if (shell.mkdir("-p", companiesFolderPath).code !== 0) {
    console.error(`${RED}Error creating the "Companies" subfolder.${RESET}`);
    return;
  }

  // Define HTTP methods and corresponding descriptions
  const tests = [
    {
      method: "GET",
      description: "should return a list of companies",
      testContent: `
        import { request, app, prisma } from "../setupTests";
        
        describe("GET /companies", () => {
          it("should return a list of companies", async () => {
            // Add a company to the database for testing
            const company = await prisma.company.create({
              data: {
                name: "Test Company",
              },
            });

            // Send a GET request to the route
            const response = await request(app).get("/companies");

            // Assert that the response is successful
            expect(response.status).toBe(200);
            await prisma.company.delete({
              where: { id: company.id },
            });
          });
        });
        `,
    },
    {
      method: "POST",
      description: "should create a new company and return it",
      testContent: `
        import { request, app, prisma } from "../setupTests";
        
        describe("POST /companies", () => {
          it("should create a new company and return it", async () => {
            // Send a POST request to the route
            const newCompanyData = {
              name: "New Test Company",
            };
            const response = await request(app).post("/companies").send(newCompanyData);

            // Assert that the response is successful and contains the inserted company
            expect(response.status).toBe(201);
            await prisma.company.delete({
              where: { id: response.body.id },
            });
          });
        });
        `,
    },
    {
      method: "PUT",
      description: "should update a company's name and return it",
      testContent: `
        import { request, app, prisma } from "../setupTests";
        
        describe("PUT /companies", () => {
          it("should update a company's name and return it", async () => {
            // Add a company to the database for testing
            const company = await prisma.company.create({
              data: {
                name: "Test Company",
              },
            });

            // Send a PUT request to update the company's name
            const updatedName = "Updated Test Company";
            const response = await request(app)
              .put("/companies/" + company.id)
              .send({ name: updatedName });

            // Assert that the response is successful
            expect(response.status).toBe(200);
            await prisma.company.delete({
              where: { id: company.id },
            });
          });
        });
        `,
    },
    {
      method: "DELETE",
      description: "should create a company and then delete it",
      testContent: `
        import { request, app, prisma } from "../setupTests";
        
        describe("DELETE /companies", () => {
          it("should create a company and then delete it", async () => {
            // Add a company to the database for testing
            const company = await prisma.company.create({
              data: {
                name: "Test Company",
              },
            });

            // Send a DELETE request to delete the company
            const response = await request(app).delete("/companies/" + company.id);

            // Assert that the response is successful
            expect(response.status).toBe(204);
          });
        });
        `,
    },
  ];

  for (const test of tests) {
    const { method, description, testContent } = test;

    // Generate a sample Jest test file inside the "Companies" subfolder
    const testFileContents = `${testContent}`;

    const testFilePath = path.join(
      companiesFolderPath,
      `${method.toLowerCase()}.test.ts`
    );
    writeFileSync(testFilePath, testFileContents);
  }

  const jestConfigPath = path.join(apiFolderPath, "jest.config.js");
  const jestConfig = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/__tests__"],
    transform: {
      "^.+\\.ts$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    verbose: true,
    testEnvironmentOptions: {
      url: "http://localhost",
    },
    collectCoverage: true,
    coverageReporters: ["json-summary"],
    testPathIgnorePatterns: ["<rootDir>/__tests__/setupTests.ts"],
  };
  writeFileSync(
    jestConfigPath,
    `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
  );

  console.log(`${GREEN}Jest configured.${RESET}`);
}
