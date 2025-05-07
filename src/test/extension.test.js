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
const path = __importStar(require("path"));
// import { runTests } from 'vscode-test';
const test_electron_1 = require("@vscode/test-electron");
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
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
        const languages = vscode.languages;
        const providers = languages.getLanguages().map(language => {
            return languages.registerCodeActionsProvider({ scheme: 'file', language }, new class {
                provideCodeActions() {
                    return [];
                }
            });
        });
        assert.ok(providers.length > 0, 'No Code Action Providers registered');
    });
});
//# sourceMappingURL=extension.test.js.map