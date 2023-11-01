#!/usr/bin/env node
import inquirer from 'inquirer';
import shell from 'shelljs';
import path from 'path';

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
    // Create a directory on the desktop with the project name
    const projectPath = path.join(process.env.HOME, 'Desktop', answers.projectName);

    if (shell.mkdir('-p', projectPath).code !== 0) {
      console.error('Error creating the project directory.');
      process.exit(1);
    }

    // Generate the project based on the user's selections
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
  // Implement Node.js project generation logic here
  // You can use shell commands or a project template

  if (options.useTDD) {
    console.log('Generating TDD tests...');
    // Implement TDD setup logic here
  }

  if (options.useMVC) {
    console.log('Generating MVC structure...');
    // Implement MVC setup logic here
  }

  console.log('Project generation completed.');
}

function generateDotNETProject(projectPath, options) {
  console.log(`Creating .NET project at ${projectPath}...`);
  // Implement .NET project generation logic here
  // You can use shell commands or a project template

  if (options.useTDD) {
    console.log('Generating TDD tests...');
    // Implement TDD setup logic here
  }

  if (options.useMVC) {
    console.log('Generating MVC structure...');
    // Implement MVC setup logic here
  }

  console.log('Project generation completed.');
}
