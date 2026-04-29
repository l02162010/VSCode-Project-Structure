const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vscode = require('vscode')
const { matchesPattern } = require('../../patternMatcher')

suite('Extension Test Suite', () => {
  const fixturePath = path.resolve(__dirname, '../fixtures/basic-project')
  const docsPath = path.join(fixturePath, 'docs')

  suiteSetup(async () => {
    const existing = vscode.workspace.workspaceFolders || []
    if (existing.length === 0 || existing[0].uri.fsPath !== fixturePath) {
      vscode.workspace.updateWorkspaceFolders(0, existing.length, { uri: vscode.Uri.file(fixturePath) })
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    await vscode.workspace.getConfiguration('vscodeProjectStructure').update('outputFolderPath', 'docs', vscode.ConfigurationTarget.Workspace)
    await vscode.workspace.getConfiguration('vscodeProjectStructure').update('useGitIgnore', true, vscode.ConfigurationTarget.Workspace)
  })

  setup(() => {
    const outputFiles = ['project_structure.txt', 'project_structure_filtered.txt', '.project_structure_ignore', '.project_structure_filter']
    outputFiles.forEach(file => {
      const fullPath = path.join(docsPath, file)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
      }
    })
  })

  test('commands are registered', async () => {
    const commands = await vscode.commands.getCommands(true)
    assert.ok(commands.includes('extension.generateProjectStructure'))
    assert.ok(commands.includes('extension.generateFilteredProjectStructure'))
  })

  test('generateProjectStructure writes output with sections and applies ignore rules', async () => {
    fs.mkdirSync(docsPath, { recursive: true })
    fs.writeFileSync(path.join(docsPath, '.project_structure_ignore'), 'README.md')

    await vscode.commands.executeCommand('extension.generateProjectStructure')

    const outputPath = path.join(docsPath, 'project_structure.txt')
    assert.ok(fs.existsSync(outputPath), 'project_structure.txt should exist')

    const output = fs.readFileSync(outputPath, 'utf-8')
    assert.ok(output.includes('--- Folder Structure ---'))
    assert.ok(output.includes('--- File Contents ---'))
    assert.ok(output.includes('src/index.js'))
    assert.ok(!output.includes('logs/app.log'))
    assert.ok(!output.includes('secret.txt'))
    assert.ok(!output.includes('README.md'))
  })

  test('generateFilteredProjectStructure includes only filtered files', async () => {
    fs.mkdirSync(docsPath, { recursive: true })
    fs.writeFileSync(path.join(docsPath, '.project_structure_filter'), 'src/index.js')

    await vscode.commands.executeCommand('extension.generateFilteredProjectStructure')

    const outputPath = path.join(docsPath, 'project_structure_filtered.txt')
    assert.ok(fs.existsSync(outputPath), 'project_structure_filtered.txt should exist')

    const output = fs.readFileSync(outputPath, 'utf-8')
    assert.ok(output.includes('--- Folder Structure ---'))
    assert.ok(output.includes('--- File Contents ---'))
    assert.ok(output.includes('--- File: src/index.js ---'))
    assert.ok(!output.includes('--- File: README.md ---'))
  })

  test('matchesPattern handles extension and substring patterns', () => {
    assert.strictEqual(matchesPattern('src/app.log', ['*.log']), true)
    assert.strictEqual(matchesPattern('docs/README.md', ['README.md']), true)
    assert.strictEqual(matchesPattern('src/index.js', ['*.ts', 'assets']), false)
  })
})
