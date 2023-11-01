import inquirer from 'inquirer';
import shell from 'shelljs';
import path from 'path';
import { writeFileSync } from 'fs';

process.on('SIGINT', () => {
    console.log('Script terminated.');
    process.exit(1);
  });

  
inquirer
  .prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the project name:',
    },
    {
      type: 'list',
      name: 'backendFramework',
      message: 'Select the backend framework:',
      choices: ['Node.js', '.NET'],
    },
    {
      type: 'confirm',
      name: 'useTDD',
      message: 'Do you want to use Test-Driven Development (TDD)?',
    },
    {
      type: 'confirm',
      name: 'useMVC',
      message: 'Do you want to use MVC structure?',
    },
  ])
  .then((answers) => {
    const projectPath = path.join(process.env.HOME, 'Desktop', answers.projectName);

    if (shell.mkdir('-p', projectPath).code !== 0) {
      console.error('Error creating the project directory.');
      process.exit(1);
    }

    if (answers.backendFramework === 'Node.js') {
      generateNodeJSProject(projectPath, answers);
    } else if (answers.backendFramework === '.NET') {
      generateDotNETProject(projectPath, answers);
    } else {
      console.error('Invalid backend framework selected.');
    }
  });

function generateNodeJSProject(projectPath, options) {
  console.log(`Creating Node.js project at ${projectPath}...`);
  
  const apiFolderPath = path.join(projectPath, 'api');
  if (shell.mkdir('-p', apiFolderPath).code !== 0) {
    console.error('Error creating the "api" folder.');
    process.exit(1);
  }

  if (options.useTDD) {
    console.log('Generating TDD tests...');
  }

  if (options.useMVC) {
    console.log('Generating MVC structure...');

    const modelsFolderPath = path.join(apiFolderPath, 'models');
    const controllersFolderPath = path.join(apiFolderPath, 'controllers');
    const servicesFolderPath = path.join(apiFolderPath, 'services');
    
    if (shell.mkdir('-p', modelsFolderPath).code !== 0) {
      console.error('Error creating the "models" folder.');
      process.exit(1);
    }

    if (shell.mkdir('-p', controllersFolderPath).code !== 0) {
      console.error('Error creating the "controllers" folder.');
      process.exit(1);
    }

    if (shell.mkdir('-p', servicesFolderPath).code !== 0) {
      console.error('Error creating the "services" folder.');
      process.exit(1);
    }

    // Generate dummy models with basic properties using Prisma
    generateDummyModel(modelsFolderPath, 'Professional', ['ID', 'Name', 'Description', 'IsActive']);
    generateDummyModel(modelsFolderPath, 'Company', ['ID', 'Name', 'Description', 'IsActive']);
    generateDummyModel(modelsFolderPath, 'Product', ['ID', 'Name', 'Description', 'IsActive']);

    // Generate basic CRUD controllers and services for each model
    generateCRUDController(controllersFolderPath, 'Professional', modelsFolderPath);
    generateCRUDService(servicesFolderPath, 'Professional', modelsFolderPath);
    generateCRUDController(controllersFolderPath, 'Company', modelsFolderPath);
    generateCRUDService(servicesFolderPath, 'Company', modelsFolderPath);
    generateCRUDController(controllersFolderPath, 'Product', modelsFolderPath);
    generateCRUDService(servicesFolderPath, 'Product', modelsFolderPath);
  }

  generateReactApp(projectPath);
}

function generateDotNETProject(projectPath, options) {
  console.log(`Creating .NET project at ${projectPath}...`);
  // Implement .NET project generation logic here
  // You can use shell commands or a project template

  if (options.useTDD) {
    console.log('Generating TDD tests...');
  }

  if (options.useMVC) {
    console.log('Generating MVC structure...');
    // Implement MVC setup logic here
  }

  generateReactApp(projectPath);
}

function generateReactApp(projectPath) {
    console.log('Generating React app with TypeScript support...');
  
    shell.exec(
      `npx create-next-app@latest ${projectPath}/client --typescript --eslint --tailwind --no-src-dir --app --import-alias @`,
      { silent: true }
    );
  }

// Function to generate a dummy model ung Prisma
function generateDummyModel(modelsFolderPath, modelName, properties) {
  const modelContent = `
model ${modelName} {
  id       Int     @id @default(autoincrement())
  ${properties.map((prop) => `${prop.padEnd(11)} String`).join('\n')}
}`;
  const modelFilePath = path.join(modelsFolderPath, `${modelName}.model.prisma`);
  writeFileSync(modelFilePath, modelContent);
  console.log(`Generated Prisma model for ${modelName}`);
}

// Function to generate basic CRUD controllers
function generateCRUDController(controllersFolderPath, modelName, modelsFolderPath) {
  const controllerContent = `
const express = require('express');
const router = express.Router();
const ${modelName}Service = require('../services/${modelName}.service');

router.get('/', async (req, res) => {
  try {
    const ${modelName.toLowerCase()} = await ${modelName}Service.getAll();
    res.json(${modelName.toLowerCase()});
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
`;
  const controllerFilePath = path.join(controllersFolderPath, `${modelName}.controller.js`);
  writeFileSync(controllerFilePath, controllerContent);
  console.log(`Generated CRUD controller for ${modelName}`);
}

// Function to generate basic CRUD services
function generateCRUDService(servicesFolderPath, modelName, modelsFolderPath) {
  const serviceContent = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dummy data for testing
const ${modelName.toLowerCase()}Data = [
  // Define your dummy data here
];

const getAll = async () => {
  // In a real implementation, you would interact with the database using Prisma
  // Here, we return dummy data for testing
  return ${modelName.toLowerCase()}Data;
};

module.exports = {
  getAll,
};
`;
  const serviceFilePath = path.join(servicesFolderPath, `${modelName}.service.js`);
  writeFileSync(serviceFilePath, serviceContent);
  console.log(`Generated CRUD service for ${modelName}`);
}
