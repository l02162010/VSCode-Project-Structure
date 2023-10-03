// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-project-structure" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('vscode-project-structure.helloWorld', function () {
  // 	// The code you place here will be executed every time your command is executed

  // 	// Display a message box to the user
  // 	vscode.window.showInformationMessage('Hello World from vscode-project-structure!');
  // });

  let disposable = vscode.commands.registerCommand('extension.generateProjectStructure', () => {
    generateProjectStructure(false)
  })

  context.subscriptions.push(disposable)

  let disposable2 = vscode.commands.registerCommand('extension.generateFilteredProjectStructure', () => {
    generateProjectStructure(true)
  })

  context.subscriptions.push(disposable2)
}

function generateProjectStructure(applyFilter = false) {
  // Defines the path to the root folder of the workspace, displays an error message if no workspace is open
  const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined
  if (!rootPath) {
    vscode.window.showErrorMessage('Fab! No workspace folder is open')
    return
  }

  // Defines the configuration object
  const config = vscode.workspace.getConfiguration('vscodeProjectStructure')

  // Defines the path to the output folder, if not defined set it to "docs"
  const outputFolderName = config.get('outputFolderPath') || 'docs'
  const outputFolderPath = path.join(rootPath, outputFolderName)

  // Creates the output folder if it doesn't exist
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath)
  }

  // Defines the path to the ignore file within the docs folder
  const ignoreFilePath = path.join(outputFolderPath, '.project_structure_ignore')
  const filterFilePath = path.join(outputFolderPath, '.project_structure_filter')

  // Initialize the ignoreFiles and filterFiles arrays
  let ignoreFiles = []
  let filterFiles = []
  let outputPath = ''

  // Check if the filter option is enabled and if the filter file exists
  if (applyFilter) {
    // if filterFilePath doesn't exist, create it
    if (!fs.existsSync(filterFilePath)) {
      fs.writeFileSync(filterFilePath, '')
    }
    // set the output path to project_structure_filtered.txt
    outputPath = path.join(outputFolderPath, 'project_structure_filtered.txt')
    // Extract list of patterns for files to filter
    const ignoreFileContent = fs.readFileSync(filterFilePath, 'utf-8')
    filterFiles = ignoreFileContent.split('\n').filter(line => line.trim() !== '')
  } else {
    // if ignoreFilePath doesn't exist, create it
    if (!fs.existsSync(ignoreFilePath)) {
      fs.writeFileSync(ignoreFilePath, '')
    }
    // iset the output path to project_structure.txt
    outputPath = path.join(outputFolderPath, 'project_structure.txt')
  }

  // Extract list of patterns for files to ignore
  if (fs.existsSync(ignoreFilePath)) {
    const ignoreFileContent = fs.readFileSync(ignoreFilePath, 'utf-8')
    ignoreFiles = ignoreFileContent.split('\n').filter(line => line.trim() !== '')
  }

  // Merge ignore file patterns with those from .gitignore file if this option is enabled
  if (config.useGitIgnore) {
    const gitIgnorePath = path.join(rootPath, '.gitignore')
    if (fs.existsSync(gitIgnorePath)) {
      const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8')
      const gitIgnorePatterns = gitIgnoreContent.split('\n').filter(line => line.trim() !== '')
      ignoreFiles = [...ignoreFiles, ...gitIgnorePatterns]
    }
  }

  let output = ''
  output += '--- Folder Structure ---\n'
  output += getFolderStructure(rootPath, ignoreFiles, 0)
  output += '\n--- File Contents ---\n'
  output += getFileContents(rootPath, ignoreFiles, filterFiles, applyFilter)

  fs.writeFileSync(outputPath, output)

  vscode.window.showInformationMessage(
    `Project structure generated successfully for ${applyFilter ? 'filtered ' : 'all'} files: 'project_structure${
      applyFilter ? '_filtered ' : ''
    }.txt'`
  )
}

function getFolderStructure(rootPath, ignoreFiles, level) {
  let output = ''

  if (fs.existsSync(rootPath)) {
    const files = fs.readdirSync(rootPath)
    files.forEach((file, index) => {
      const fullPath = path.join(rootPath, file)
      const relativePath = path.relative(rootPath, fullPath)

      if (matchesPattern(relativePath, ignoreFiles)) {
        return
      }

      const isLastFile = index === files.length - 1
      const prefix = level === 0 ? '' : isLastFile ? '└── ' : '├── '
      const indent = ' '.repeat(level * 4) + (level > 0 ? prefix : '')

      if (fs.lstatSync(fullPath).isDirectory()) {
        output += indent + `[${file}]\n`
        output += getFolderStructure(fullPath, ignoreFiles, level + 1)
      } else {
        output += indent + file + '\n'
      }
    })
  }

  return output
}

function getFileContents(rootPath, ignoreFiles, filterFiles, applyFilter = false) {
  let output = ''

  const readDirectory = directory => {
    let results = []
    const files = fs.readdirSync(directory)

    files.forEach(file => {
      const fullPath = path.join(directory, file)
      const relativePath = path.relative(rootPath, fullPath)

      if (matchesPattern(relativePath, ignoreFiles)) {
        return
      }

      if (fs.lstatSync(fullPath).isDirectory()) {
        results = results.concat(readDirectory(fullPath))
      } else {
        results.push(fullPath)
      }
    })

    return results
  }

  const filePaths = readDirectory(rootPath)

  filePaths.forEach(filePath => {
    // If apply filter is on, ignore files that don't match the filter patterns
    const relativePath = path.relative(rootPath, filePath)
    if (applyFilter && !matchesPattern(filePath, filterFiles)) {
      return
    }
    output += `\n--- File: ${relativePath} ---\n`
    output += fs.readFileSync(filePath, 'utf-8') + '\n'
  })

  return output
}

function matchesPattern(relativePath, listOfPatterns) {
  for (const pattern of listOfPatterns) {
    if (pattern.startsWith('*')) {
      const fileExtension = path.extname(relativePath)
      if (fileExtension === pattern.slice(1)) {
        return true
      }
    } else if (relativePath.includes(pattern)) {
      return true
    }
  }

  return false
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
