import inquirer from "inquirer";
import shell from "shelljs";
import path from "path";
import { writeFileSync } from "fs";

// Define ANSI color codes
const GREEN = "\x1b[32m";
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

    generateNodeJSProject(projectPath, answers);
  });

function generateNodeJSProject(projectPath, options) {
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

  if (options.useTDD) {
    console.log("Generating TDD tests...");
  }

  generateEnvFile(apiFolderPath);
  generatePrismaSchema(apiFolderPath);
  generateRouterFile(apiFolderPath);
  generateServerFile(apiFolderPath);
  generateReactApp(projectPath);
  console.log(`Project created at ${projectPath}.`);
}

function generatePrismaSchema(apiFolderPath) {
  const prismaSchema = `
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }

  model Professional {
    id        Int       @id @default(autoincrement())
    name      String
    company   Company   @relation(fields: [companyId], references: [id])
    companyId Int
    products  Product[]
  }

  model Company {
    id            Int            @id @default(autoincrement())
    name          String
    professionals Professional[]
  }

  model Product {
    id             Int           @id @default(autoincrement())
    name           String
    professional   Professional? @relation(fields: [professionalId], references: [id])
    professionalId Int?
  }
  
  `;

  const prismaSchemaPath = path.join(apiFolderPath, "prisma", "schema.prisma");
  shell.mkdir("-p", path.join(apiFolderPath, "prisma"));
  writeFileSync(prismaSchemaPath, prismaSchema);
  console.log(`${GREEN}Generated Prisma schema file.${RESET}`);
}

function generateRouterFile(apiFolderPath) {
  const routerContent = `
  import express from "express";
  import { PrismaClient } from "@prisma/client"; // Import PrismaClient
  
  const router = express.Router();
  const prisma = new PrismaClient(); // Create a PrismaClient instance
  
  // GET route to list companies
  router.get("/companies", async (req, res) => {
    try {
      const companies = await prisma.company.findMany();
      res.status(200).json(companies);
    } catch (error) {
      res.status(500).json({ error: "Error listing companies" });
    }
  });
  
  // POST route to create a new company
  router.post("/companies", async (req, res) => {
    try {
      const { name } = req.body;
      const company = await prisma.company.create({
        data: {
          name,
        },
      });
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ error: "Error creating company" });
    }
  });
  
  // PUT route to update a company
  router.put("/companies/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const company = await prisma.company.update({
        where: { id: parseInt(id) },
        data: {
          name,
        },
      });
      res.status(200).json(company);
    } catch (error) {
      res.status(500).json({ error: "Error updating company" });
    }
  });
  
  // DELETE route to delete a company
  router.delete("/companies/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.company.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error deleting company" });
    }
  });
  
  // GET route to list professionals
  router.get("/professionals", async (req, res) => {
    try {
      const professionals = await prisma.professional.findMany();
      res.status(200).json(professionals);
    } catch (error) {
      res.status(500).json({ error: "Error listing professionals" });
    }
  });
  
  // POST route to create a new professional
  router.post("/professionals", async (req, res) => {
    try {
      const { name, companyId } = req.body;
      const professional = await prisma.professional.create({
        data: {
          name,
          companyId,
        },
      });
      res.status(201).json(professional);
    } catch (error) {
      res.status(500).json({ error: "Error creating professional" });
    }
  });
  
  // PUT route to update a professional
  router.put("/professionals/:id", async (req, res) => {
    const { id } = req.params;
    const { name, companyId } = req.body;
    try {
      const professional = await prisma.professional.update({
        where: { id: parseInt(id) },
        data: {
          name,
          companyId,
        },
      });
      res.status(200).json(professional);
    } catch (error) {
      res.status(500).json({ error: "Error updating professional" });
    }
  });
  
  // DELETE route to delete a professional
  router.delete("/professionals/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.professional.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error deleting professional" });
    }
  });
  
  // GET route to list products
  router.get("/products", async (req, res) => {
    try {
      const products = await prisma.product.findMany();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Error listing products" });
    }
  });
  
  // POST route to create a new product
  router.post("/products", async (req, res) => {
    try {
      const { name, professionalId } = req.body;
      const product = await prisma.product.create({
        data: {
          name,
          professionalId,
        },
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Error creating product" });
    }
  });
  
  // PUT route to update a product
  router.put("/products/:id", async (req, res) => {
    const { id } = req.params;
    const { name, professionalId } = req.body;
    try {
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name,
          professionalId,
        },
      });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Error updating product" });
    }
  });
  
  // DELETE route to delete a product
  router.delete("/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.product.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error deleting product" });
    }
  });
  
  // Hello World route
  router.get("/", (req, res) => {
    res.send("Hello, World!");
  });
  
  export default router;
`;

  const routerFilePath = path.join(apiFolderPath, "router.ts");
  writeFileSync(routerFilePath, routerContent);
  console.log(`${GREEN}Generated router.ts file.${RESET}`);
}

function generateServerFile(apiFolderPath) {
  const serverContent = `
import express from 'express';
import cors from 'cors';
import router from './router';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', router);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`;

  const serverFilePath = path.join(apiFolderPath, "server.ts");
  writeFileSync(serverFilePath, serverContent);
  console.log(`${GREEN}Generated server.ts file.${RESET}`);

  const packageJsonContent = {
    name: "api",
    version: "1.0.0",
    description: "Your app description",
    main: "server.ts",
    scripts: {
      dev: "ts-node-dev --inspect --transpile-only --ignore-watch node_modules server.ts",
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
    },
    devDependencies: {
      "@types/node": "^20.8.10",
      "@types/express": "^4.17.20",
      "@types/cors": "2.8.15",
      typescript: "^5.2.2",
      prisma: "^5.5.2",
    },
  };

  // Convert packageJsonContent to a JSON string
  const packageJsonString = JSON.stringify(packageJsonContent, null, 2);

  const packageJsonPath = path.join(apiFolderPath, "package.json");

  // Write the JSON string to the package.json file
  writeFileSync(packageJsonPath, packageJsonString);
  console.log(`${GREEN}Generated package.json file.${RESET}`);

  const npmInstallProcess = shell.exec("npm install", {
    cwd: apiFolderPath,
    stdio: "inherit",
    silent: true,
  });
  if (npmInstallProcess.code === 0) {
    console.log(`${GREEN}npm install completed.${RESET}`);
  } else {
    console.error(`${RED}Error running npm install.${RESET}`);
  }

  // Run npm tsc --init and npm add -D ts-node-dev
  const tscInitProcess = shell.exec("npx tsc --init", {
    cwd: apiFolderPath,
    stdio: "inherit",
    silent: true,
  });
  if (tscInitProcess.code === 0) {
    console.log(`${GREEN}npx tsc --init completed.${RESET}`);
  } else {
    console.error(`${RED}Error running npm tsc --init.${RESET}`);
  }

  const tsNodeDevProcess = shell.exec("npm add -D ts-node-dev", {
    cwd: apiFolderPath,
    stdio: "inherit",
    silent: true,
  });
  if (tsNodeDevProcess.code === 0) {
    console.log(`${GREEN}npm add -D ts-node-dev completed.${RESET}`);
  } else {
    console.error(`${RED}Error running npm add -D ts-node-dev.${RESET}`);
  }

  const prismaMigrationProcess = shell.exec(
    "npx prisma migrate dev --name init",
    {
      cwd: apiFolderPath,
      stdio: "inherit",
      silent: true,
    }
  );
  if (prismaMigrationProcess.code === 0) {
    console.log(`${GREEN}Prisma migration completed.${RESET}`);
  } else {
    console.error(`${RED}Error on Prisma migration.${RESET}`);
  }
}

function generateEnvFile(apiFolderPath) {
  const envContent = `DATABASE_URL="file:./dev.db"`;

  const envFilePath = path.join(apiFolderPath, ".env");
  writeFileSync(envFilePath, envContent);
  console.log(`${GREEN}Generated .env file.${RESET}`);
}

function generateReactApp(projectPath) {
  console.log("Generating React app with TypeScript support...");

  const reactInstallProcess = shell.exec(
    `npx create-next-app@latest ${projectPath}/client --typescript --eslint --tailwind --no-src-dir --app --import-alias @`,
    { stdio: "inherit", silent: true }
  );

  if (reactInstallProcess.code === 0) {
    shell.cd(`${projectPath}/client`);

    // Create a "lib" folder if it doesn't exist
    if (!shell.test("-d", "lib")) {
      shell.mkdir("lib");
    }
    shell.exec(
      "npm install axios@latest devextreme@latest devextreme-react@latest --save --save-exact",
      {
        stdio: "inherit",
        silent: true,
      }
    );

    // Create and configure axios.ts in the "lib" folder
    const axiosConfig = `
        import axios from 'axios';
        
        const api = axios.create({
          baseURL: 'http://localhost:3333', // Replace with your API URL
        });
        
        export default api;
        `;

    shell.ShellString(axiosConfig).to("lib/axios.ts");

    // Change the contents of page.tsx
    const pageContents = `
    "use client";
    import api from "../lib/axios";
    import { DataGrid } from "devextreme-react";
    import "devextreme/dist/css/dx.light.css";
    import CustomStore from "devextreme/data/custom_store";
    import { useEffect, useState } from "react";
    import { Column } from "devextreme-react/data-grid";
    
    export default function Home() {
      const [store, setStore] = useState<CustomStore>(new CustomStore());
      const [selectedButton, setSelectedButton] = useState<string>("companies");
    
      useEffect(() => {
        setStore(
          new CustomStore({
            key: "id",
            async load(loadOptions) {
              const { data } = await api.get("/" + selectedButton); // not using string interpol because of tilde errors on CLI script.
              return data;
            },
            async insert(values) {
              await api.post("/" + selectedButton, values);
            },
            async update(key, values) {
              await api.put("/" + selectedButton + "/" + key, values);
            },
            async remove(key) {
              await api.delete("/" + selectedButton + "/" + key);
            },
          })
        );
      }, [selectedButton]);
    
      return (
        <div
          style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              flex: "0.1",
              display: "flex",
              justifyContent: "center",
              gap: 30,
            }}
          >
            <button onClick={() => setSelectedButton("professionals")}>
              Professionals
            </button>
            <button onClick={() => setSelectedButton("companies")}>
              Companies
            </button>
            <button onClick={() => setSelectedButton("products")}>Products</button>
          </div>
          <DataGrid
            dataSource={store}
            editing={{
              allowAdding: true,
              allowUpdating: true,
              allowDeleting: true,
            }}
          >
            <Column dataField="id" allowEditing={false} />
            <Column dataField="name" />
            {(selectedButton === "professionals" ||
              selectedButton === "products") && (
              <Column
                dataType="number"
                dataField={
                  selectedButton === "professionals"
                    ? "companyId"
                    : "professionalId"
                }
              />
            )}
          </DataGrid>
        </div>
      );
    }
`;

    // Navigate to the "app" folder and update the page.tsx file
    shell.cd("app");
    shell.ShellString(pageContents).to("page.tsx");

    shell.cd("..");
    console.log(`${GREEN}React app created.${RESET}`);
  } else {
    console.error(`${RED}Error creating React app.${RESET}`);
  }
}
