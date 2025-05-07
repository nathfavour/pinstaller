import * as vscode from 'vscode';
import * as path from 'path';

const supportedLanguages = ['typescript', 'javascript']; // Add more languages as needed

export function activate(context: vscode.ExtensionContext) {
  console.log('pinstaller is now active!');

  // Register Code Action Provider
  supportedLanguages.forEach(language => {
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file', language }, // Adjust for other languages if needed
      new InstallDependencyProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  });

}

class InstallDependencyProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] | undefined {
    const diagnostics = context.diagnostics.filter(diagnostic =>
      diagnostic.message.includes('Cannot find module')
    );

    if (diagnostics.length === 0) {
      return;
    }

    const actions: vscode.CodeAction[] = [];
    diagnostics.forEach(diagnostic => {
      const match = diagnostic.message.match(/Cannot find module '(.*)'/);
      if (match) {
        const packageName = this.extractPackageName(match[1]);
        const action = new vscode.CodeAction(
          `Install ${packageName}`,
          vscode.CodeActionKind.QuickFix
        );
        action.command = {
          command: 'pinstaller.installDependency',
          title: `Install ${packageName}`,
          arguments: [packageName, document.uri]
        };
        actions.push(action);
      }
    });

    return actions;
  }

  private extractPackageName(importPath: string): string {
    // Handle submodules (e.g., lodash/map → lodash)
    const parts = importPath.split('/');
    return importPath.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
  }
}

vscode.commands.registerCommand('pinstaller.installDependency', async (packageName: string, fileUri?: vscode.Uri) => {
  let workspaceFolder: vscode.WorkspaceFolder | undefined;
  if (fileUri) {
    workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
  }
  if (!workspaceFolder && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    workspaceFolder = vscode.workspace.workspaceFolders[0];
  }
  const packageManager = await detectPackageManager(workspaceFolder);
  if (!packageManager) {
    vscode.window.showErrorMessage('No package manager detected in the workspace.');
    return;
  }

  const terminal = vscode.window.createTerminal('pinstaller');
  terminal.show();
  terminal.sendText(`${packageManager} add ${packageName}`);
});

export async function detectPackageManager(workspaceFolder?: vscode.WorkspaceFolder): Promise<string | null> {
  let workspacePath: string | undefined;
  if (workspaceFolder) {
    workspacePath = workspaceFolder.uri.fsPath;
  } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
  } else {
    return null;
  }

  // Check for pnpm, yarn, and npm lock files in order of priority
  const lockFiles = [
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'yarn.lock', manager: 'yarn' },
    { file: 'package-lock.json', manager: 'npm' },
  ];

  for (const { file, manager } of lockFiles) {
    if (await fileExists(path.join(workspacePath, file))) {
      return manager;
    }
  }

  return null;
}

function fileExists(filePath: string): Promise<boolean> {
  return new Promise(resolve => {
    require('fs').access(filePath, require('fs').constants.F_OK, (err: any) => {
      resolve(!err);
    });
  });
}

export function deactivate() {}