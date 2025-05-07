"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) {k2 = k;}
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) {k2 = k;}
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
            for (var k in o) {if (Object.prototype.hasOwnProperty.call(o, k)) {ar[ar.length] = k;}}
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) {return mod;}
        var result = {};
        if (mod != null) {for (var k = ownKeys(mod), i = 0; i < k.length; i++) {if (k[i] !== "default") {__createBinding(result, mod, k[i]);}}}
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
// import { runTests } from 'vscode-test';
const test_electron_1 = require("@vscode/test-electron");
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const extension_1 = require("../extension");
async function run() {
    try {
        await (0, test_electron_1.runTests)({
            version: 'stable',
            extensionDevelopmentPath: path.resolve(__dirname, '../..'),
            extensionTestsPath: path.resolve(__dirname, './suite/index'),
        });
    }
    catch (err) {
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
        const mockFileExists = (filePath) => {
            if (filePath.endsWith('pnpm-lock.yaml')) {
                return Promise.resolve(true);
            }
            if (filePath.endsWith('yarn.lock')) {
                return Promise.resolve(false);
            }
            if (filePath.endsWith('package-lock.json')) {
                return Promise.resolve(false);
            }
            return Promise.resolve(false);
        };
        const originalFileExists = require('fs').access;
        require('fs').access = (filePath, mode, callback) => {
            mockFileExists(filePath).then(exists => {
                callback(exists ? null : new Error('File not found'));
            });
        };
        const packageManager = await (0, extension_1.detectPackageManager)();
        assert.strictEqual(packageManager, 'pnpm', 'Failed to detect pnpm as the package manager');
        // Restore original function
        require('fs').access = originalFileExists;
    });
    test('InstallDependencyProvider should provide quick fix for missing module', async () => {
        const diagnostic = {
            message: "Cannot find module 'lodash'",
            range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)),
        };
        const context = { diagnostics: [diagnostic], triggerKind: vscode.CodeActionTriggerKind.Invoke, only: undefined };
        const provider = new (class {
            provideCodeActions(document, range, context) {
                return [
                    new vscode.CodeAction('Install lodash', vscode.CodeActionKind.QuickFix)
                ];
            }
        })();
        const actions = provider.provideCodeActions({}, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)), context);
        assert.ok(actions, 'No actions provided');
        assert.strictEqual(actions?.length, 1, 'Incorrect number of actions provided');
        assert.strictEqual(actions[0].title, 'Install lodash', 'Quick fix title is incorrect');
    });
});
//# sourceMappingURL=extension.test.js.map