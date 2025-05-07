import * as path from 'path';
// import { runTests } from 'vscode-test';
import { runTests } from '@vscode/test-electron';


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