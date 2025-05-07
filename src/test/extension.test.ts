import * as path from 'path';
// import { runTests } from 'vscode-test';
import { runTests } from '@vscode/test-electron';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { detectPackageManager } from '../extension';

async function run() {
	try {
		await runTests({
			version: 'stable',
			extensionDevelopmentPath: path.resolve(__dirname, '../..'),
			extensionTestsPath: path.resolve(__dirname, './suite/index'),
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

run();

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be active', async () => {
    const extension = vscode.extensions.getExtension('your-publisher-name.pinstaller');
    assert.ok(extension, 'Extension is not found');
    assert.strictEqual(extension?.isActive, true, 'Extension is not active');
  });

  test('InstallDependencyProvider should be registered', async () => {
    const languages = await vscode.languages.getLanguages();
    const providers = languages.map(language => {
      return vscode.languages.registerCodeActionsProvider({ scheme: 'file', language }, new class {
        provideCodeActions() {
          return [];
        }
      });
    });

    assert.ok(providers.length > 0, 'No Code Action Providers registered');
  });

  test('detectPackageManager should detect the correct package manager', async () => {
    const mockFileExists = (filePath: string) => {
      if (filePath.endsWith('pnpm-lock.yaml')) { return Promise.resolve(true); }
      if (filePath.endsWith('yarn.lock')) { return Promise.resolve(false); }
      if (filePath.endsWith('package-lock.json')) { return Promise.resolve(false); }
      return Promise.resolve(false);
    };

    const originalFileExists = require('fs').access;
    require('fs').access = (filePath: string, mode: any, callback: any) => {
      mockFileExists(filePath).then(exists => {
        callback(exists ? null : new Error('File not found'));
      });
    };

    const packageManager = await detectPackageManager();
    assert.strictEqual(packageManager, 'pnpm', 'Failed to detect pnpm as the package manager');

    // Restore original function
    require('fs').access = originalFileExists;
  });

  test('InstallDependencyProvider should provide quick fix for missing module', async () => {
    const diagnostic = {
      message: "Cannot find module 'lodash'",
      range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)),
    } as vscode.Diagnostic;

    const context = { diagnostics: [diagnostic], triggerKind: vscode.CodeActionTriggerKind.Invoke, only: undefined } as vscode.CodeActionContext;
    const provider = new (class implements vscode.CodeActionProvider {
      provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext) {
        return [
          new vscode.CodeAction('Install lodash', vscode.CodeActionKind.QuickFix)
        ];
      }
    })();

    const actions = provider.provideCodeActions({} as vscode.TextDocument, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)), context);

    assert.ok(actions, 'No actions provided');
    assert.strictEqual(actions?.length, 1, 'Incorrect number of actions provided');
    assert.strictEqual(actions![0].title, 'Install lodash', 'Quick fix title is incorrect');
  });
});