# PInstaller - Dependency Installer for VSCode

PInstaller is a Visual Studio Code extension designed to streamline the process of installing dependencies directly from import statements. It simplifies your workflow by detecting uninstalled packages and providing a quick fix to install them using your preferred Node.js package manager.

## Features

- **Automatic Package Detection**: Detects uninstalled packages from import statements with red error underlines.
- **Quick Fix Installation**: Provides a "Quick Fix" option to install the missing package when hovering over the error.
- **Package Manager Support**: Supports popular Node.js package managers like `npm`, `yarn`, and `pnpm`.
- **Intelligent Package Name Parsing**: Accurately identifies package names, even when submodules are included in the import path.
- **Seamless Integration**: Automatically detects the package manager being used in your project.

## How It Works

1. Write your import statement in your code.
2. If the package is not installed, a red error underline will appear.
3. Hover over the error and select the "Quick Fix" option.
4. PInstaller will install the package using your default package manager.

## Installation

1. Open the Extensions view in VSCode (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).
2. Search for `PInstaller`.
3. Click "Install" to add the extension to your editor.

## Usage

1. Ensure your project is using one of the supported package managers (`npm`, `yarn`, or `pnpm`).
2. Write your import statements as usual.
3. Hover over any uninstalled package import with a red underline.
4. Select the "Quick Fix" option to install the package.

## Supported Package Managers

- npm
- yarn
- pnpm

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the [MIT License](LICENSE).

---

Happy coding with PInstaller! 🚀  