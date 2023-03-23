// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-project-structure" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('vscode-project-structure.helloWorld', function () {
  // 	// The code you place here will be executed every time your command is executed

  // 	// Display a message box to the user
  // 	vscode.window.showInformationMessage('Hello World from vscode-project-structure!');
  // });

  let disposable = vscode.commands.registerCommand(
    "extension.generateProjectStructure",
    () => {
      generateProjectStructure();
    }
  );

  context.subscriptions.push(disposable);
}

function getConfig() {
    return vscode.workspace.getConfiguration('vscodeProjectStructure');
  }
  

function generateProjectStructure() {
  const rootPath = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;

  if (!rootPath) {
    vscode.window.showErrorMessage("No workspace folder is open");
    return;
  }

  const ignoreFilePath = path.join(rootPath, ".project_structure_ignore");
  let ignoreFiles = [];

  if (fs.existsSync(ignoreFilePath)) {
    const ignoreFileContent = fs.readFileSync(ignoreFilePath, "utf-8");
    ignoreFiles = ignoreFileContent
      .split("\n")
      .filter((line) => line.trim() !== "");
  }

  if (getConfig().useGitIgnore) {
    const gitIgnorePath = path.join(rootPath, ".gitignore");
    if (fs.existsSync(gitIgnorePath)) {
      const gitIgnoreContent = fs.readFileSync(gitIgnorePath, "utf-8");
      const gitIgnorePatterns = gitIgnoreContent
        .split("\n")
        .filter((line) => line.trim() !== "");
      ignoreFiles = [...ignoreFiles, ...gitIgnorePatterns];
    }
  }

  let output = "";
  output += "--- Folder Structure ---\n";
  output += getFolderStructure(rootPath, ignoreFiles, 0);

  output += "\n--- File Contents ---\n";
  output += getFileContents(rootPath, ignoreFiles);

  const outputPath = path.join(rootPath, "project_structure.txt");
  fs.writeFileSync(outputPath, output);

  vscode.window.showInformationMessage(
    "Project structure generated successfully"
  );
}

function getFolderStructure(dir, ignoreFiles, level) {
  let output = "";

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach((file, index) => {
      const fullPath = path.join(dir, file);
      const relativePath = path.relative(process.cwd(), fullPath);

      if (shouldIgnore(relativePath, ignoreFiles)) {
        return;
      }

      const isLastFile = index === files.length - 1;
      const prefix = level === 0 ? "" : isLastFile ? "└── " : "├── ";
      const indent = " ".repeat(level * 4) + (level > 0 ? prefix : "");

      if (fs.lstatSync(fullPath).isDirectory()) {
        output += indent + `[${file}]\n`;
        output += getFolderStructure(fullPath, ignoreFiles, level + 1);
      } else {
        output += indent + file + "\n";
      }
    });
  }

  return output;
}

function getFileContents(dir, ignoreFiles) {
  let output = "";

  const readDirectory = (directory) => {
    let results = [];
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const fullPath = path.join(directory, file);
      const relativePath = path.relative(process.cwd(), fullPath);

      if (shouldIgnore(relativePath, ignoreFiles)) {
        return;
      }

      if (fs.lstatSync(fullPath).isDirectory()) {
        results = results.concat(readDirectory(fullPath));
      } else {
        results.push(fullPath);
      }
    });

    return results;
  };

  const filePaths = readDirectory(dir);

  filePaths.forEach((filePath) => {
    const relativePath = path.relative(dir, filePath);
    output += `\n--- File: ${relativePath} ---\n`;
    output += fs.readFileSync(filePath, "utf-8") + "\n";
  });

  return output;
}

function shouldIgnore(relativePath, ignorePatterns) {
  for (const pattern of ignorePatterns) {
    if (pattern.startsWith("*")) {
      const fileExtension = path.extname(relativePath);
      if (fileExtension === pattern.slice(1)) {
        return true;
      }
    } else if (relativePath.includes(pattern)) {
      return true;
    }
  }

  return false;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
