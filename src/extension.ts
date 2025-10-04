import * as vscode from 'vscode';
import { BaselineDataService } from './services/BaselineDataService';
import { CompatibilityDiagnosticProvider } from './providers/CompatibilityDiagnosticProvider';
import { BaselineHoverProvider } from './providers/BaselineHoverProvider';
import { BaselineTreeDataProvider } from './providers/BaselineTreeDataProvider';
import { BaselineDashboardProvider } from './providers/BaselineDashboardProvider';
import { BaselineStatusBar } from './ui/BaselineStatusBar';
import { BaselineCommands } from './ui/BaselineCommands';

let dataService: BaselineDataService;
let diagnosticProvider: CompatibilityDiagnosticProvider;
let hoverProvider: BaselineHoverProvider;
let treeDataProvider: BaselineTreeDataProvider;
let dashboardProvider: BaselineDashboardProvider;
let statusBar: BaselineStatusBar;
let commands: BaselineCommands;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Baseline-Aware Development Assistant is now active!');

    // Initialize services
    dataService = new BaselineDataService(context);
    await dataService.initialize();

    // Initialize providers
    diagnosticProvider = new CompatibilityDiagnosticProvider(dataService);
    hoverProvider = new BaselineHoverProvider(dataService);
    treeDataProvider = new BaselineTreeDataProvider(dataService);
    dashboardProvider = new BaselineDashboardProvider(dataService);

    // Initialize UI components
    statusBar = new BaselineStatusBar(dataService);
    commands = new BaselineCommands(dataService, diagnosticProvider, dashboardProvider);

    // Register providers
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline');
    context.subscriptions.push(diagnosticCollection);

    // Set up file watchers for automatic checking
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{html,css,js,ts,tsx}');
    watcher.onDidChange(async (uri) => {
        if (vscode.workspace.getConfiguration('baseline').get('autoCheck', true)) {
            const document = await vscode.workspace.openTextDocument(uri);
            const diagnostics = await diagnosticProvider.provideDiagnostics(document, new vscode.CancellationTokenSource().token);
            diagnosticCollection.set(uri, diagnostics || []);
        }
    });
    context.subscriptions.push(watcher);

    // Manual diagnostic checking on command
    const checkDocument = async (document: vscode.TextDocument) => {
        const diagnostics = await diagnosticProvider.provideDiagnostics(document, new vscode.CancellationTokenSource().token);
        diagnosticCollection.set(document.uri, diagnostics || []);
    };

    // Check active document on activation
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        checkDocument(activeEditor.document);
    }

    // Register hover provider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            { scheme: 'file', language: 'html' },
            hoverProvider
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            { scheme: 'file', language: 'css' },
            hoverProvider
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            { scheme: 'file', language: 'javascript' },
            hoverProvider
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            { scheme: 'file', language: 'typescript' },
            hoverProvider
        )
    );

    // Register tree view
    context.subscriptions.push(
        vscode.window.createTreeView('baselineFeatures', {
            treeDataProvider: treeDataProvider
        })
    );

    context.subscriptions.push(
        vscode.window.createTreeView('baselineWarnings', {
            treeDataProvider: treeDataProvider
        })
    );

    // Register webview panel
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'baselineDashboard',
            dashboardProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('baseline.checkCompatibility', () => {
            commands.checkCompatibility();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('baseline.showDashboard', () => {
            commands.showDashboard();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('baseline.refreshData', () => {
            commands.refreshData();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('baseline.configureProject', () => {
            commands.configureProject();
        })
    );

    // Initialize status bar
    statusBar.initialize();

    // Update context for when clauses
    vscode.commands.executeCommand('setContext', 'baseline.hasProject', true);
    vscode.commands.executeCommand('setContext', 'baseline.hasWarnings', false);

    console.log('Baseline-Aware Development Assistant activation complete');
}

export function deactivate() {
    if (dataService) {
        dataService.dispose();
    }
    if (statusBar) {
        statusBar.dispose();
    }
}
