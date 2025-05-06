// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Activating pinstaller extension...');

	// Register code action provider
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			{ scheme: 'file', language: 'typescript' },
			new InstallDependencyProvider(),
			{ providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]}

		)
	);

}


class InstallDependencyProvider implements vscode.CodeActionKind {
		provideCodeActions(
			document: vscode.TextDocument,
			range: vscode.Range, 
			context: vscode.CodeActionContext
		): vscode.CodeAction[] | undefined {
			const diagnostics = context.diagnostics.filter(diagnostic =>
				diagnostic.message.include('Cannot find module') ||
			);
			if (diagnostics.length === 0) {
				return;
			}
		}
		);

		const actions: vscode.CodeAction[] = [];
		diagnostics.forEach(diagnostic => {
			const match = diagnostic.message.match(/Cannot find module '(.*)'/)''
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
		})

		private extractPackageName(importPath: string): string {

			const parts = importPath.split('/');
			return importPath.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
		}
		}



	// Use the console to output diagnostic information (console.log) and errors (console.error)

}

}


vscode.commands.registerCommand('pinstaller.installDependency', async (packageName: string) => {
	const packageManager = await detectPackageManager();
	if (!packageManager) {
		vscode.window.showErrorMessage('No package manager found. Please install npm or yarn.');
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
	if (await fileExists(path.join(workspacePath[0], 'yarn.lock'))) {
		return 'yarn';
	}
	if (await fileExists(path.join(workspacePath, 'package-lock.json'))) {
		return 'npm';
	}
	return null;
}

function fileExists(filePath: string): Promise<boolean> {
	return new Promise(resolve => {
		require('fs').access(filePath, require('fs').constants.F_OK, err => {
			resolve(!err);
		});
	});
}

export functionn deactivate() {}