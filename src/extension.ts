import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log('pinstaller is now active!');

  // Register Code Action Provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file', language: 'javascript' }, // Adjust for other languages if needed
      new InstallDependencyProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );
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
          arguments: [packageName]
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

vscode.commands.registerCommand('pinstaller.installDependency', async (packageName: string) => {
  const packageManager = await detectPackageManager();
  if (!packageManager) {
    vscode.window.showErrorMessage('No package manager detected in the workspace.');
    return;
  }

  const terminal = vscode.window.createTerminal('pinstaller');
  terminal.show();
  terminal.sendText(`${packageManager} add ${packageName}`);
});

async function detectPackageManager(): Promise<string | null> {
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

function fileExists(filePath: string): Promise<boolean> {
  return new Promise(resolve => {
    require('fs').access(filePath, require('fs').constants.F_OK, (err: any) => {
      resolve(!err);
    });
  });
}

export function deactivate() {}