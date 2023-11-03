import path from "path";
import shell from "shelljs";
import { writeFileSync } from "fs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateJestTests(apiFolderPath) {
  console.log("Generating Jest tests...");

  // Create a folder for Jest test files
  const testFolderPath = path.join(apiFolderPath, "__tests__", "companies"); // Update the path
  if (shell.mkdir("-p", testFolderPath).code !== 0) {
    console.error(`${RED}Error creating the Jest test folder.${RESET}`);
    return;
  }

  // Define HTTP methods and corresponding descriptions
  const tests = [
    {
      method: "GET",
      description: "should return a list of companies",
    },
    {
      method: "POST",
      description: "should create a new company and return it",
    },
    {
      method: "PUT",
      description: "should update a company's name and return it",
    },
    {
      method: "DELETE",
      description: "should create a company and then delete it",
    },
  ];

  for (const test of tests) {
    const { method, description } = test;

    // Generate a sample Jest test file
    const testFileContents = `
      import request from "supertest";
      import app from "../../server"; // You should import your Express app
      import { PrismaClient } from "@prisma/client";
      
      const prisma = new PrismaClient();
      
      describe("${method} /companies", () => {
        it("${description}", async () => {
          ${
            method === "GET"
              ? `
          // Add a company to the database for testing
          const company = await prisma.company.create({
            data: {
              name: "Test Company",
            },
          });
  
          // Send a ${method} request to the route
          const response = await request(app).${method.toLowerCase()}("/companies");
  
          // Assert that the response is successful and contains the test company
          expect(response.status).toBe(200);
          expect(response.body).toEqual([company]);
  
          // Clean up: Remove the test company from the database
          await prisma.company.delete({
            where: {
              id: company.id,
            },
          });
          `
              : method === "POST"
              ? `// Send a POST request to the route
          const newCompanyData = {
            name: "New Test Company",
          };
          const response = await request(app)
            .post("/companies")
            .send(newCompanyData);
  
          // Assert that the response is successful and contains the inserted company
          expect(response.status).toBe(201);
          expect(response.body).toMatchObject(newCompanyData);
          `
              : method === "PUT"
              ? `// Add a company to the database for testing
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
  
          // Assert that the response is successful and contains the updated company
          expect(response.status).toBe(200);
          expect(response.body.name).toBe(updatedName);
  
          // Clean up: Remove the test company from the database
          await prisma.company.delete({
            where: {
              id: company.id,
            },
          });
          `
              : `// Add a company to the database for testing
          const company = await prisma.company.create({
            data: {
              name: "Test Company",
            },
          });
  
          // Send a DELETE request to delete the company
          const response = await request(app)
            .delete("/companies/" + company.id);
  
          // Assert that the response is successful and has a 204 status code
          expect(response.status).toBe(204);
  
          // Clean up: Ensure the company is deleted from the database
          const deletedCompany = await prisma.company.findUnique({
            where: { id: company.id },
          });
          expect(deletedCompany).toBe(null);
          `
          }
        });
      });
      
      `;

    const testFilePath = path.join(
      testFolderPath,
      `${method.toLowerCase()}.test.ts`
    );
    writeFileSync(testFilePath, testFileContents);
  }

  // Add Jest configuration
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
  };

  const jestConfigPath = path.join(apiFolderPath, "jest.config.js");
  writeFileSync(
    jestConfigPath,
    `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
  );

  console.log(`${GREEN}Jest configured.${RESET}`);
}
