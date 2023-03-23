# VSCode Project Structure

## Description
VSCode Project Structure is a Visual Studio Code extension that allows you to generate a txt file with the folder structure, file name, and file contents of your project.

## Features
- Generates a txt file with the folder structure, file name, and file contents of your project.
- Customize the output file name and location.
- Exclude files and folders from the output.

## Usage
- Open the command palette (Ctrl+Shift+P on Windows/Linux, Cmd+Shift+P on macOS).
- Type "Generate Project Structure" and select the corresponding command.
- Enter the output file name and location in the input prompt.
- Wait for the extension to finish generating the file.
- use .project_structure_ignore file to ignore folder or file
- integrate the patterns defined in your .gitignore file

## Examples

.project_structure_ignore file

```
bash
node_modules
dist
*.log
```
This will ignore the node_modules and dist directories, and any files with the .log extension.

To enable the useGitIgnore setting, open your Visual Studio Code settings (File > Preferences > Settings), and search for "Project Structure". Enable the "Use Git Ignore" checkbox to automatically integrate the patterns defined in your .gitignore file.

## Requirements
Visual Studio Code version 1.76.0 or higher.

## Extension Settings
This extension does not provide any settings at the moment.

## Release Notes
0.0.1
Initial release of VSCode Project Structure.

## Contributing
Contributions are always welcome! If you have any ideas or suggestions for new features, feel free to open an issue or a pull request.

## License
This extension is licensed under the MIT License.

