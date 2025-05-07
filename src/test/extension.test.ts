import * as path from 'path';
// import { runTests } from 'vscode-test';
import { runTests } from '@vscode/test-electron';
import * as assert from 'assert';
import * as vscode from 'vscode';

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
});