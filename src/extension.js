"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function activate(context) {
    console.log('pinstaller is now active!');
    // Register Code Action Provider
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file', language: 'javascript' }, // Adjust for other languages if needed
    new InstallDependencyProvider(), { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }));
}
class InstallDependencyProvider {
    provideCodeActions(document, range, context) {
        const diagnostics = context.diagnostics.filter(diagnostic => diagnostic.message.includes('Cannot find module'));
        if (diagnostics.length === 0) {
            return;
        }
        const actions = [];
        diagnostics.forEach(diagnostic => {
            const match = diagnostic.message.match(/Cannot find module '(.*)'/);
            if (match) {
                const packageName = this.extractPackageName(match[1]);
                const action = new vscode.CodeAction(`Install ${packageName}`, vscode.CodeActionKind.QuickFix);
                action.command = {
                    command: 'pinstaller.installDependency',
                    title: `Install ${packageName}`,
                    arguments: [packageName]
                };
                actions.push(action);
            }
        });
        return actions;
    }
    extractPackageName(importPath) {
        // Handle submodules (e.g., lodash/map → lodash)
        const parts = importPath.split('/');
        return importPath.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
    }
}
vscode.commands.registerCommand('pinstaller.installDependency', async (packageName) => {
    const packageManager = await detectPackageManager();
    if (!packageManager) {
        vscode.window.showErrorMessage('No package manager detected in the workspace.');
        return;
    }
    const terminal = vscode.window.createTerminal('pinstaller');
    terminal.show();
    terminal.sendText(`${packageManager} add ${packageName}`);
});
async function detectPackageManager() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return null;
    }
    const workspacePath = workspaceFolders[0].uri.fsPath;
    if (await fileExists(path.join(workspacePath, 'pnpm-lock.yaml'))) {
        return 'pnpm';
    }
    if (await fileExists(path.join(workspacePath, 'yarn.lock'))) {
        return 'yarn';
    }
    if (await fileExists(path.join(workspacePath, 'package-lock.json'))) {
        return 'npm';
    }
    return null;
}
function fileExists(filePath) {
    return new Promise(resolve => {
        require('fs').access(filePath, require('fs').constants.F_OK, (err) => {
            resolve(!err);
        });
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map