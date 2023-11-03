import path from "path";
import shell from "shelljs";
import { writeFileSync } from "fs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateServerFile(apiFolderPath) {
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
  
  export default app;
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
      test: "jest",
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
    },
    devDependencies: {
      "@types/node": "^20.8.10",
      "@types/express": "^4.17.20",
      "@types/cors": "2.8.15",
      "@types/jest": "^29.5.7",
      "@types/supertest": "^2.0.15",
      typescript: "^5.2.2",
      prisma: "^5.5.2",
      "ts-jest": "^29.1.1",
      jest: "^29.7.0",
      supertest: "^6.3.3",
    },
  };

  // Convert packageJsonContent to a JSON string
  const packageJsonString = JSON.stringify(packageJsonContent, null, 2);

  const packageJsonPath = path.join(apiFolderPath, "package.json");

  // Write the JSON string to the package.json file
  writeFileSync(packageJsonPath, packageJsonString);
  console.log(`${GREEN}Generated package.json file.${RESET}`);
  console.log(`Installing backend dependencies...`);

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
