import inquirer from "inquirer";
import shell from "shelljs";
import path from "path";
import { writeFileSync } from "fs";

process.on("SIGINT", () => {
  console.log("Script terminated.");
  process.exit(1);
});

inquirer
  .prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the project name:",
    },
    // {
    //   type: 'confirm',
    //   name: 'useTDD',
    //   message: 'Do you want to use Test-Driven Development (TDD)?',
    // },
  ])
  .then((answers) => {
    const projectPath = path.join(
      process.env.HOME,
      "Desktop",
      answers.projectName
    );

    if (shell.mkdir("-p", projectPath).code !== 0) {
      console.error("Error creating the project directory.");
      process.exit(1);
    }

    generateNodeJSProject(projectPath, answers);
  });

function generateNodeJSProject(projectPath, options) {
  console.log(`Creating Node.js project at ${projectPath}...`);

  const apiFolderPath = path.join(projectPath, "api");
  if (shell.mkdir("-p", apiFolderPath).code !== 0) {
    console.error('Error creating the "api" folder.');
    process.exit(1);
  }

  // Generate .gitignore file
  const gitignoreContent = `/node_modules`;
  const gitignorePath = path.join(apiFolderPath, ".gitignore");
  writeFileSync(gitignorePath, gitignoreContent);

  if (options.useTDD) {
    console.log("Generating TDD tests...");
  }

  generateRouterFile(apiFolderPath);
  generateServerFile(apiFolderPath);
  generateReactApp(projectPath);
  console.log("Project created at " + projectPath);
}

function generateRouterFile(apiFolderPath) {
  const routerContent = `
import express from 'express';

const router = express.Router();

// Hello World route
router.get('/', (req, res) => {
  res.send('Hello, World!');
});

router.get('/professionals', (req, res) => {
    // Implement route logic for the "professionals" model
});

router.get('/companies', (req, res) => {
    // Implement route logic for the "companies" model
});

router.get('/products', (req, res) => {
    // Implement route logic for the "products" model
});

export default router;
`;

  const routerFilePath = path.join(apiFolderPath, "router.ts");
  writeFileSync(routerFilePath, routerContent);
  console.log("Generated router.ts file");
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`;

  const serverFilePath = path.join(apiFolderPath, "server.ts");
  writeFileSync(serverFilePath, serverContent);
  console.log("Generated server.ts file");

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
    },
  };

  // Convert packageJsonContent to a JSON string
  const packageJsonString = JSON.stringify(packageJsonContent, null, 2);

  const packageJsonPath = path.join(apiFolderPath, "package.json");

  // Write the JSON string to the package.json file
  writeFileSync(packageJsonPath, packageJsonString);

  console.log("Generated package.json file");

  const npmInstallProcess = shell.exec("npm install", {
    cwd: apiFolderPath,
    stdio: "inherit",
    silent: true,
  });
  if (npmInstallProcess.code === 0) {
    console.log("npm install completed.");
  } else {
    console.error("Error running npm install.");
  }

  // Run npm tsc --init and npm add -D ts-node-dev
  const tscInitProcess = shell.exec("npx tsc --init", {
    cwd: apiFolderPath,
    stdio: "inherit",
    silent: true,
  });
  if (tscInitProcess.code === 0) {
    console.log("npx tsc --init completed.");
  } else {
    console.error("Error running npm tsc --init.");
  }

  const tsNodeDevProcess = shell.exec("npm add -D ts-node-dev", {
    cwd: apiFolderPath,
    stdio: "inherit",
    silent: true,
  });
  if (tsNodeDevProcess.code === 0) {
    console.log("npm add -D ts-node-dev completed.");
  } else {
    console.error("Error running npm add -D ts-node-dev.");
  }
}

function generateReactApp(projectPath) {
  console.log("Generating React app with TypeScript support...");

  const reactInstallProcess = shell.exec(
    `npx create-next-app@latest ${projectPath}/client --typescript --eslint --tailwind --no-src-dir --app --import-alias @`,
    { stdio: "inherit", silent: true }
  );

  if (reactInstallProcess.code === 0) {
    console.log("React app created.");
  } else {
    console.error("Error creating React app.");
  }
}
