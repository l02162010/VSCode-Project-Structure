# VSCode Project Structure

## Description

VSCode Project Structure is a Visual Studio Code extension that allows you to generate a txt file with the folder structure, file name, and file contents of your project.

## Table of Contents

- Features
- Usage
- Examples
- Requirements
- Extension Settings
- Release Notes
- Contributing
- License

## Features

- Generates a txt file with the folder/file structure tree and full file contents of your project.
- Option to exclude certain files and folders based on patterns found in the `.project_structure_ignore` file and/or in the `.gitignore` file
- Customize the folder where the configuration and output files are located (`docs` by default)

## Usage

- Open the command palette (Ctrl+Shift+P on Windows/Linux, Cmd+Shift+P on macOS).
- Type `Generate Project Structure` and select the desired command:
  - `All files`: Generates `project_structure.txt` containing **Project Structure** and **File Contents** for all files, except those matching the **ignore patterns**,
  - `Filtered files`: Also generates `project_structure_filtered.txt` containing both the the **Project Structure** for all files (except those matching the **ignore patterns**), and **File Contents** only for those matching the **filter patterns**
- Wait for the extension to finish generating the file.
- Use `.project_structure_ignore` to list your **ignore patterns**,
- Use `.project_structure_filter` to list your **filter patterns**

By default:

- **Ignore patterns** cinlude the ones defined in your `.gitignore` file
- all configuration and output files are located in the `docs` directory

## Examples

This `.project_structure_ignore` file will cause Project Structure to ignore: the node_modules and dist directories, and any files with the .log extension:

```
node_modules
dist
*.log
```

This `.project_structure_filter` file will cause Project Structure to only provide full content of the package.json file, as well as any in the src folder (excluding those that match the ignore pattern):

```
src
package.json
```

## Requirements

Visual Studio Code version 1.76.0 or higher.

## Extension Settings

To change extension settings, open your Visual Studio Code settings (File > Preferences > Settings), and search for "Project Structure". You can then:

- Exclude `.gitignore` from the **ignore patterns** (true by default)
- Change the configuration/output folder (`docs` by default).

## Release Notes

- 0.1.3
  - Added option to change the configuration/output folder
  - Added option to apply filter to output file
- 0.0.1
  - Initial release of VSCode Project Structure.

## Contributing

Contributions are always welcome! If you have any ideas or suggestions for new features, feel free to open an issue or a pull request.

## License

This extension is licensed under the MIT License.
