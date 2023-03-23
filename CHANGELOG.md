# Change Log

All notable changes to the "vscode-project-structure" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release

## [0.0.3] - 2023-03-24

### Added
- Added support for .project_structure_ignore file for user-defined ignore patterns.
- Integrated with .gitignore file when useGitIgnore setting is enabled.

### Examples
Create a .project_structure_ignore file in your project root to define custom ignore patterns. The file should contain one pattern per line. For example:
```
bash
node_modules
dist
*.log
```
This will ignore the node_modules and dist directories, and any files with the .log extension.

To enable the useGitIgnore setting, open your Visual Studio Code settings (File > Preferences > Settings), and search for "Project Structure". Enable the "Use Git Ignore" checkbox to automatically integrate the patterns defined in your .gitignore file.